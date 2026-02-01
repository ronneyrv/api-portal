const topModel = require("../models/top");

const converterParaNumeroSQL = (valor) => {
  if (valor === null || valor === undefined || valor.toString().trim() === "") {
    return null;
  }
  const valorLimpo = valor.toString().replace(/\./g, "").replace(",", ".");
  return parseFloat(valorLimpo);
};

class TopController {
  async listarTarifas(req, res) {
    try {
      const tarifa = await topModel.listarTarifas();
      res.status(200).json({
        type: "success",
        data: tarifa,
      });
    } catch (error) {
      res.status(500).json({
        type: "error",
        message: "Erro ao buscar dados de tarifa",
        error: error.message,
      });
    }
  }

  async listarCompleto(req, res) {
    const { ano } = req.params;
    try {
      const rawData = await topModel.listarCompleto(ano);
      const empresas = ["EP", "ENEVA", "AMP"];
      const meses = [
        "jan",
        "fev",
        "mar",
        "abr",
        "mai",
        "jun",
        "jul",
        "ago",
        "set",
        "out",
        "nov",
        "dez",
      ];

      const cargaTop = rawData.volumes;
      const analiseTop = empresas.map((emp) => {
        const obj = { empresa: emp };
        meses.forEach((mesNome, index) => {
          const mesNum = index + 1;
          const somaCarga = rawData.volumes
            .filter((v) => v.empresa === emp && v.mes === mesNum)
            .reduce((acc, curr) => acc + curr.carga, 0);
          obj[mesNome] = somaCarga;
        });
        return obj;
      });

      const realTop = [];
      const trimestres = [
        { id: "T1", meses: [1, 2, 3] },
        { id: "T2", meses: [4, 5, 6] },
        { id: "T3", meses: [7, 8, 9] },
        { id: "T4", meses: [10, 11, 12] },
      ];

      trimestres.forEach((tri) => {
        const dadosTri = empresas.map((emp) => {
          const topBase =
            rawData.topEmpresas.find((t) => t.empresa === emp)?.volume || 0;
          const topTrimestre = topBase / 4;
          const realizado = rawData.volumes
            .filter((v) => v.empresa === emp && tri.meses.includes(v.mes))
            .reduce((acc, curr) => acc + curr.carga, 0);
          const saldo = -topTrimestre + realizado;

          return {
            periodo: tri.id,
            empresa: emp,
            top: topTrimestre,
            realizado,
            saldo,
          };
        });

        const saldoAMP = dadosTri.find((d) => d.empresa === "AMP")?.saldo || 0;

        dadosTri.forEach((item) => {
          let rateio = 0;
          if (saldoAMP > 0) {
            if (item.empresa === "EP") rateio = (2 / 3) * saldoAMP;
            if (item.empresa === "ENEVA") rateio = (1 / 3) * saldoAMP;
          }

          const tarifa =
            rawData.valores.find((v) => v.trimestre === tri.id)?.tarifa || 0;
          const rateado =
            rawData.rateiosFixos.find(
              (r) => r.empresa === item.empresa && r.trimestre === tri.id,
            )?.rateio || 0;
          const saldoFim = item.saldo + rateado;

          realTop.push({
            ...item,
            rateio,
            saldoFim,
            tarifa,
            rateado,
            apagar: Math.abs(saldoFim) * tarifa,
          });
        });
      });

      // --- Geração do topAnual ---
      const empresasAnual = ["EP", "ENEVA"];
      const topAnual = empresasAnual.map((emp) => {
        const dadosEmpresa = realTop.filter((r) => r.empresa === emp);
        const somaTop = dadosEmpresa.reduce((acc, curr) => acc + curr.top, 0);
        const somaRealizado = dadosEmpresa.reduce(
          (acc, curr) => acc + curr.realizado,
          0,
        );
        const somaRateado = dadosEmpresa.reduce(
          (acc, curr) => acc + curr.rateado,
          0,
        );

        const maiorTarifa = Math.max(...dadosEmpresa.map((d) => d.tarifa), 0);
        const saldo = somaRealizado - somaTop;
        const saldoFim = saldo + somaRateado;
        const apagar = Math.abs(saldoFim) * maiorTarifa;

        return {
          empresa: emp,
          top: somaTop,
          realizado: somaRealizado,
          saldo: saldo,
          saldoFim: saldoFim,
          rateado: somaRateado,
          tarifa: maiorTarifa,
          apagar: apagar,
        };
      });

      res.status(200).json({
        type: "success",
        data: { cargaTop, analiseTop, realTop, topAnual },
      });
    } catch (error) {
      res.status(500).json({
        type: "error",
        message: "Erro ao processar Take Or Pay",
        error: error.message,
      });
    }
  }

  async rateio(req, res) {
    const { periodo, empresa } = req.params;
    try {
      const rateado = await topModel.rateio(periodo, empresa);
      res.status(200).json({
        type: "success",
        data: rateado,
      });
    } catch (error) {
      res.status(500).json({
        type: "error",
        message: "Erro ao buscar dados de rateio",
        error: error.message,
      });
    }
  }

  async adicionar(req, res) {
    const { dados } = req.body;
    if (
      !dados.ano ||
      !dados.mes ||
      !dados.empresa ||
      !dados.navio ||
      !dados.carga
    ) {
      return res
        .status(200)
        .json({ type: "error", message: "Dados obrigatórios" });
    }

    dados.mes = parseInt(dados.mes);
    dados.carga = converterParaNumeroSQL(dados.carga);
    dados.navio = dados.navio.toLocaleUpperCase("pt-BR");
    if (dados.obs) {
      dados.obs = dados.obs.toLocaleUpperCase("pt-BR");
    }

    try {
      await topModel.adicionar(dados);
      return res.status(200).json({
        type: "success",
        message: "Carga adicionada com sucesso",
      });
    } catch (error) {
      res.status(500).json({
        type: "error",
        message: "Erro ao adicionar carga",
        error: error.message,
      });
    }
  }

  async atualizar(req, res) {
    const { dados } = req.body;
    if (!dados) {
      return res.status(200).json({
        type: "error",
        message: "Erro nos dados para atualização!",
      });
    }

    dados.mes = parseInt(dados.mes);
    dados.carga = converterParaNumeroSQL(dados.carga);
    dados.navio = dados.navio.toLocaleUpperCase("pt-BR");
    if (dados.obs) {
      dados.obs = dados.obs.toLocaleUpperCase("pt-BR");
    }

    try {
      const result = await topModel.atualizar(dados);

      if (result && result.rowsAffected && result.rowsAffected[0] === 0) {
        return res.status(200).json({
          type: "error",
          message: `Carga não atualizada.`,
        });
      }

      return res.status(200).json({
        type: "success",
        message: `Carga atualizada com sucesso`,
      });
    } catch (error) {
      res.status(500).json({
        type: "error",
        message: `Erro ao atualizar carga`,
        error: error.message,
      });
    }
  }

  async atualizaRateio(req, res) {
    const { dados } = req.body;

    if (!dados.rateio || !dados.empresa || !dados.trimestre) {
      return res.status(200).json({
        type: "error",
        message: "Dados obrigatórios.",
      });
    }
    dados.rateio = converterParaNumeroSQL(dados.rateio);

    try {
      const result = await topModel.atualizaRateio(dados);
      if (result.rowsAffected[0] === 0) {
        return res.status(200).json({
          type: "error",
          message: `Rateio não atualizado.`,
        });
      }

      return res.status(200).json({
        type: "success",
        message: `Rateio atualizado com sucesso`,
      });
    } catch (error) {
      res.status(500).json({
        type: "error",
        message: `Erro ao atualizar rateio`,
        error: error.message,
      });
    }
  }

  async atualizaTarifa(req, res) {
    const { dados } = req.body;

    if (!dados) {
      return res.status(200).json({
        type: "error",
        message: "Dados obrigatórios.",
      });
    }

    try {
      const tarifasParaAtualizar = [
        {
          trimestre: dados.trimestre1,
          tarifa: converterParaNumeroSQL(dados.tarifa1),
        },
        {
          trimestre: dados.trimestre2,
          tarifa: converterParaNumeroSQL(dados.tarifa2),
        },
        {
          trimestre: dados.trimestre3,
          tarifa: converterParaNumeroSQL(dados.tarifa3),
        },
        {
          trimestre: dados.trimestre4,
          tarifa: converterParaNumeroSQL(dados.tarifa4),
        },
      ];

      for (const item of tarifasParaAtualizar) {
        await topModel.atualizaTarifa(item);
      }

      return res.status(200).json({
        type: "success",
        message: `Tarifas atualizadas com sucesso`,
      });
    } catch (error) {
      res.status(500).json({
        type: "error",
        message: `Erro ao atualizar tarifa`,
        error: error.message,
      });
    }
  }

  async deletar(req, res) {
    const { id } = req.params;
    if (!id) {
      return res.status(200).json({
        type: "error",
        message: "Carga não localizada para exclusão",
      });
    }
    try {
      await topModel.deletar(id);
      return res.status(200).json({
        type: "success",
        message: "Carga excluída com sucesso",
      });
    } catch (error) {
      res.status(500).json({
        type: "error",
        message: "Erro ao excluir carga",
        error: error.message,
      });
    }
  }
}

module.exports = new TopController();
