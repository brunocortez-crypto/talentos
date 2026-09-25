"""Gera o SQL que carrega a aba BD da planilha BD_Talentos.xlsx nas tabelas do Supabase.

Uso: python scripts/importar_planilha.py <planilha.xlsx> <saida.sql>

Pode rodar de novo com a planilha atualizada: o SQL apaga as vagas que vieram
da planilha e recarrega, sem mexer nas vagas criadas pelo sistema.
"""

import datetime as dt
import json
import re
import sys
import unicodedata
from collections import Counter, defaultdict

import openpyxl

COLUNAS = [
    "Projeto", "Empresa Faturamento", "Abertura", "Cliente", "Cidade", "Vaga",
    "Receita", "Analista", "Status", "OBS", "Data de conclusão", "Faturamento",
]

# Mesmo cliente escrito de formas que a normalização automática não junta.
CLIENTES_MESMO_NOME = {
    "Punch Sabia": "Punch - Patio Sabia",
    "Punch Sabiá": "Punch - Patio Sabia",
    "Punch Vinhedos": "Punch - Patio Vinhedos",
    "Akkar Sabiá": "Akkar Patio Sabia",
    "Casa da Parmegiana": "Casa do Parmegiana",
    "Gellato Borelli": "Gelato Borelli",
    "Gelato Uberlandia Shopping": "Gelato Borelli - Uberlândia Shopping",
    "Gelato Landscape": "Gelato Borelli - Landscape",
    "Santos EPI's": "Santos EPIs",
    "BusinessCont": "Business Cont",
    "Ecos Solar": "Ecos Energia Solar",
    "Morada Nova - Mat Constr": "Morada Nova (Mat. Construção)",
    "Digital + cont": "Digital + Contabilidade",
    "Contabilidade Consultec": "Consultec Contabilidade",
    "Contabilidade Hoffmam": "Hoffmam Contabilidade",
    "ContabTech": "Contabitech",
    "Top Conter": "Top Cont",
    "Hands Financeiro": "Hands",
}

# Datas digitadas com erro na planilha (conferidas uma a uma).
DATAS_CORRIGIDAS = {
    "26/09/20/25": dt.date(2025, 9, 26),
    "05/0622025": dt.date(2025, 6, 5),
    "17/062025": dt.date(2025, 6, 17),
    "29/07/0205": dt.date(2025, 7, 29),
    "21/092/2026": dt.date(2026, 9, 21),
}

STATUS = {
    "concluída": "concluida",
    "cancelada": "cancelada",
    "aberta": "aberta",
    "substituição": "substituicao",
    "faturar": "faturar",
    "congelada": "congelada",
}

SUFIXO_CONTABIL = re.compile(r"\s+(contabilidade|contabil|contábil)$", re.IGNORECASE)


def chave(texto):
    sem_acento = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", " ", sem_acento.lower()).strip()


def limpo(valor):
    if valor is None:
        return None
    texto = re.sub(r"\s+", " ", str(valor)).strip()
    return texto or None


def escolher_grafia(variantes, preferidos):
    """Nome da lista oficial, depois com inicial maiúscula, depois o mais usado, depois com acento."""
    return max(variantes, key=lambda v: (
        v in preferidos, v[:1].isupper(), variantes[v], sum(ord(c) > 127 for c in v), len(v),
    ))


def unificar(nomes, chave_de, preferidos=frozenset()):
    grupos = defaultdict(Counter)
    for nome in nomes:
        grupos[chave_de(nome)][nome] += 1
    canonico = {}
    for variantes in grupos.values():
        escolhido = escolher_grafia(variantes, preferidos)
        for v in variantes:
            canonico[v] = escolhido
    return canonico


def chave_cliente(nome):
    base = chave(SUFIXO_CONTABIL.sub("", nome))
    return base or chave(nome)


def data(valor, avisos, linha, coluna):
    if valor is None:
        return None, None
    if isinstance(valor, dt.datetime):
        return valor.date(), None
    texto = limpo(valor)
    if texto in DATAS_CORRIGIDAS:
        avisos.append(f"linha {linha}: {coluna} '{texto}' corrigida para {DATAS_CORRIGIDAS[texto]:%d/%m/%Y}")
        return DATAS_CORRIGIDAS[texto], None
    return None, texto


def tipo_faturamento(texto):
    if not texto or texto == "-":
        return None
    t = texto.lower()
    if t.startswith("ok"):
        return "substituicao" if "subst" in t else "normal"
    if t.startswith(("sub", "subt")):
        return "substituicao"
    if t.startswith("repos"):
        return "reposicao"
    if t.startswith("bon"):
        return "bonificacao"
    if t.startswith("cancel"):
        return "cancelada"
    raise ValueError(f"Faturamento desconhecido: {texto!r}")


def projeto_e_canal(projeto):
    projeto = limpo(projeto)
    if projeto.startswith("Escalar"):
        _, _, canal = projeto.partition(" - ")
        return "Escalar", canal or None
    if chave(projeto) == "outros negocios":
        return "Outros Negócios", None
    return projeto, None


def empresa_e_canal(empresa, projeto, avisos, linha):
    empresa = limpo(empresa)
    if empresa and empresa.startswith("Escalar Talentos"):
        _, _, canal = empresa.partition(" - ")
        return "Escalar Talentos", canal or None, False
    if empresa == "Escritorial Talentos":
        return empresa, None, False
    if empresa:
        avisos.append(f"linha {linha}: empresa de faturamento '{empresa}' não existe; preenchida pelo projeto")
    return ("Escalar Talentos" if projeto == "Escalar" else "Escritorial Talentos"), None, True


def cargo_e_quantidade(vaga):
    vaga = limpo(vaga)
    achou = re.search(r"\((\d{1,2})\)", vaga)
    if not achou:
        return vaga, 1
    cargo = limpo(vaga[: achou.start()] + vaga[achou.end():])
    return cargo, int(achou.group(1))


def sql(valor):
    if valor is None:
        return "null"
    if isinstance(valor, (int, float)):
        return repr(valor)
    if isinstance(valor, dt.date):
        return f"'{valor.isoformat()}'"
    return "'" + str(valor).replace("'", "''") + "'"


def clientes_oficiais(caminho):
    livro = openpyxl.load_workbook(caminho, read_only=True, data_only=True)
    if "Página5" not in livro.sheetnames:
        return frozenset()
    valores = (limpo(c) for linha in livro["Página5"].iter_rows(values_only=True) for c in linha)
    return frozenset(v for v in valores if v and v != "Cliente")


def ler_linhas(caminho):
    aba = openpyxl.load_workbook(caminho, data_only=True)["BD"]
    cabecalho = [limpo(c) for c in next(aba.iter_rows(min_row=1, max_row=1, values_only=True))]
    faltando = [c for c in COLUNAS if c not in cabecalho]
    if faltando:
        sys.exit(f"Colunas não encontradas na aba BD: {faltando}")
    idx = {c: cabecalho.index(c) for c in COLUNAS}
    for numero, valores in enumerate(aba.iter_rows(min_row=2, values_only=True), start=2):
        linha = {c: valores[i] for c, i in idx.items()}
        if any(v is not None and str(v).strip() for v in linha.values()):
            yield numero, linha


def numero_positivo(valor):
    return isinstance(valor, (int, float)) and valor > 0


def salarios_da_aba_resultado(caminho, cliente_de):
    """Salário, % cobrado e repasse que só existem na aba Resultado (versão antiga da BD).

    Só devolve as chaves (abertura, cliente, vaga) em que a aba não se contradiz.
    """
    livro = openpyxl.load_workbook(caminho, data_only=True)
    aba = next((livro[n] for n in livro.sheetnames if n.strip() == "Resultado"), None)
    if aba is None:
        return {}
    linhas = aba.iter_rows(values_only=True)
    cabecalho = [limpo(c) for c in next(linhas)]
    pos = {c: cabecalho.index(c) for c in ("Abertura", "Cliente", "Vaga", "Salario", "% Receita", "Receita Escalar")}
    achados = defaultdict(set)
    for valores in linhas:
        salario, percentual = valores[pos["Salario"]], valores[pos["% Receita"]]
        if not numero_positivo(salario) or not numero_positivo(percentual):
            continue
        abertura, _ = data(valores[pos["Abertura"]], [], 0, "")
        cliente = limpo(valores[pos["Cliente"]])
        if abertura is None or cliente is None:
            continue
        repasse = valores[pos["Receita Escalar"]]
        chave_vaga = (abertura, chave_cliente(cliente_de(cliente)), chave(limpo(valores[pos["Vaga"]])))
        achados[chave_vaga].add((
            round(float(salario), 2),
            round(float(percentual) * 100, 2),
            round(float(repasse), 2) if isinstance(repasse, (int, float)) else 0.0,
        ))
    return {k: next(iter(v)) for k, v in achados.items() if len(v) == 1}


def main(entrada, saida):
    linhas = list(ler_linhas(entrada))
    avisos = []

    nomes_clientes = [CLIENTES_MESMO_NOME.get(limpo(l["Cliente"]), limpo(l["Cliente"])) for _, l in linhas]
    cliente_canonico = unificar(nomes_clientes, chave_cliente, clientes_oficiais(entrada))
    cidade_canonica = unificar([limpo(l["Cidade"]) for _, l in linhas if limpo(l["Cidade"])], chave)

    def cliente_de(nome):
        nome = CLIENTES_MESMO_NOME.get(nome, nome)
        return cliente_canonico.get(nome, nome)

    salarios = salarios_da_aba_resultado(entrada, cliente_de)

    vagas, receitas, empresas_inferidas = [], [], 0
    for numero, l in linhas:
        projeto, canal = projeto_e_canal(l["Projeto"])
        empresa, canal_empresa, inferida = empresa_e_canal(l["Empresa Faturamento"], projeto, avisos, numero)
        empresas_inferidas += inferida
        cargo, quantidade = cargo_e_quantidade(l["Vaga"])
        abertura, abertura_texto = data(l["Abertura"], avisos, numero, "Abertura")
        if abertura is None:
            sys.exit(f"linha {numero}: data de abertura inválida {abertura_texto!r}")
        conclusao, conclusao_texto = data(l["Data de conclusão"], avisos, numero, "Conclusão")
        observacoes = limpo(l["OBS"])
        if conclusao_texto and conclusao_texto != "-":
            observacoes = f"{observacoes} (conclusão: {conclusao_texto})" if observacoes else f"Conclusão: {conclusao_texto}"
        status = STATUS.get(limpo(l["Status"]).lower())
        if status is None:
            sys.exit(f"linha {numero}: status desconhecido {l['Status']!r}")
        cliente = cliente_de(limpo(l["Cliente"]))
        receita = round(float(l["Receita"] or 0), 2)
        original = json.dumps(
            {c: (v.isoformat() if isinstance(v, dt.datetime) else v) for c, v in l.items()}, ensure_ascii=False
        )

        if chave(cargo) == "mensalidade":
            receitas.append({
                "linha": numero, "projeto": projeto, "empresa": empresa,
                "cliente": projeto if chave(cliente) == "mensalidade" else cliente,
                "descricao": cargo, "valor": receita, "competencia": abertura,
                "obs": observacoes, "original": original,
            })
            continue

        salario, percentual, repasse = salarios.get(
            (abertura, chave_cliente(cliente), chave(limpo(l["Vaga"]))), (None, None, 0.0)
        )
        vagas.append({
            "linha": numero, "projeto": projeto, "empresa": empresa, "canal": canal or canal_empresa,
            "cliente": cliente, "cidade": cidade_canonica.get(limpo(l["Cidade"])), "cargo": cargo,
            "quantidade": quantidade, "receita": receita, "salario": salario, "percentual": percentual,
            "repasse": repasse, "analista": limpo(l["Analista"]), "status": status,
            "tipo": tipo_faturamento(limpo(l["Faturamento"])), "obs": observacoes,
            "abertura": abertura, "conclusao": conclusao, "original": original,
        })

    analistas = sorted({v["analista"] for v in vagas if v["analista"]})
    clientes = sorted({v["cliente"] for v in vagas} | {r["cliente"] for r in receitas})
    colunas_vaga = list(vagas[0])
    colunas_receita = list(receitas[0]) if receitas else []

    def valores(registros, colunas):
        return ",\n".join("  (" + ", ".join(sql(r[c]) for c in colunas) + ")" for r in registros)

    with open(saida, "w", encoding="utf-8") as f:
        f.write("-- Gerado por scripts/importar_planilha.py a partir da aba BD.\nbegin;\n\n")
        f.write("insert into public.analistas (nome) values\n")
        f.write(",\n".join(f"  ({sql(a)})" for a in analistas) + "\non conflict (nome) do nothing;\n\n")
        f.write("insert into public.clientes (nome) values\n")
        f.write(",\n".join(f"  ({sql(c)})" for c in clientes) + "\non conflict (nome) do nothing;\n\n")
        f.write("delete from public.vagas where planilha_linha is not null;\n")
        f.write("delete from public.receitas_fixas where planilha_linha is not null;\n\n")
        f.write(
            "insert into public.vagas (planilha_linha, projeto_id, empresa_faturamento, canal, cliente_id, cidade,\n"
            "  cargo, quantidade, receita, salario, percentual_cobrado, repasse, analista_id, status,\n"
            "  tipo_faturamento, observacoes, data_abertura, data_conclusao, planilha_original)\n"
            "select t.linha::int, p.id, t.empresa, t.canal, c.id, t.cidade, t.cargo, t.quantidade::int,\n"
            "  t.receita::numeric, t.salario::numeric, t.percentual::numeric, t.repasse::numeric, a.id, t.status,\n"
            "  t.tipo, t.obs, t.abertura::date, t.conclusao::date, t.original::jsonb\n"
            f"from (values\n{valores(vagas, colunas_vaga)}\n) as t({', '.join(colunas_vaga)})\n"
            "join public.projetos p on p.nome = t.projeto\n"
            "join public.clientes c on c.nome = t.cliente\n"
            "left join public.analistas a on a.nome = t.analista;\n\n"
        )
        if receitas:
            f.write(
                "insert into public.receitas_fixas (planilha_linha, projeto_id, empresa_faturamento, cliente_id,\n"
                "  descricao, valor, competencia, observacoes, planilha_original)\n"
                "select t.linha::int, p.id, t.empresa, c.id, t.descricao, t.valor::numeric, t.competencia::date,\n"
                "  t.obs, t.original::jsonb\n"
                f"from (values\n{valores(receitas, colunas_receita)}\n) as t({', '.join(colunas_receita)})\n"
                "join public.projetos p on p.nome = t.projeto\n"
                "join public.clientes c on c.nome = t.cliente;\n\n"
            )
        f.write(
            "do $$ begin\n"
            f"  if (select count(*) from public.vagas where planilha_linha is not null) <> {len(vagas)}\n"
            f"  or (select count(*) from public.receitas_fixas where planilha_linha is not null) <> {len(receitas)} then\n"
            f"    raise exception 'Importação incompleta: esperava {len(vagas)} vagas e {len(receitas)} receitas fixas';\n"
            "  end if;\nend $$;\n\ncommit;\n"
        )

    juntados = defaultdict(set)
    for original, destino in cliente_canonico.items():
        if original != destino:
            juntados[destino].add(original)
    presentes = {limpo(l["Cliente"]) for _, l in linhas}
    for original, destino in CLIENTES_MESMO_NOME.items():
        if original in presentes:
            juntados[cliente_canonico.get(destino, destino)].add(original)

    print(f"Vagas: {len(vagas)} | Receitas fixas: {len(receitas)} | Clientes: {len(clientes)} | "
          f"Analistas: {len(analistas)} ({', '.join(analistas)})")
    total_vagas, total_fixas = sum(v["receita"] for v in vagas), sum(r["valor"] for r in receitas)
    print(f"Receita: vagas R$ {total_vagas:,.2f} + fixas R$ {total_fixas:,.2f} = R$ {total_vagas + total_fixas:,.2f}")
    print(f"Vagas com salário da aba Resultado: {sum(v['salario'] is not None for v in vagas)}")
    print(f"Empresa de faturamento preenchida pelo projeto: {empresas_inferidas} vagas")
    print(f"Clientes unificados ({len(juntados)}):")
    for destino, origens in sorted(juntados.items()):
        print(f"  {destino}  <-  {', '.join(sorted(origens))}")
    print("Avisos:")
    for a in avisos:
        print(" ", a)
    print(f"SQL gravado em {saida}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
