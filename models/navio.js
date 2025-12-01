const { poolPromise, sql } = require("../infraestrutura/conexao");

class NavioModel {
  async adicionar(dados) {
    const query = `
      INSERT INTO descarregamento_navios
      (navio, cliente, carvao_tipo, atracacao, inicio_op, arqueacao_inicial, saldo, taxa, meta, dias, finalizado)
      VALUES (@navio, @cliente, @carvao_tipo, @atracacao, @inicio_op, @arqueacao_inicial, @saldo, @taxa, @meta, @dias, @finalizado)
    `;

    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("navio", sql.VarChar, dados.navio)
        .input("cliente", sql.VarChar, dados.cliente)
        .input("carvao_tipo", sql.VarChar, dados.carvao_tipo)
        .input("atracacao", sql.DateTime, dados.atracacao)
        .input("inicio_op", sql.DateTime, dados.inicio_op)
        .input("arqueacao_inicial", sql.Float, dados.arqueacao_inicial)
        .input("saldo", sql.Float, dados.arqueacao_inicial)
        .input("taxa", sql.Float, 0)
        .input("meta", sql.Decimal(5, 2), 4.5)
        .input("dias", sql.Decimal(5, 2), 0)
        .input("finalizado", sql.Bit, 0)
        .query(query);

      return result;
    } catch (err) {
      console.error("Erro ao adicionar navio:", err);
      throw err;
    }
  }

  async listar() {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .query("SELECT * FROM descarregamento_navios");
      return result.recordset;
    } catch (err) {
      console.error("Erro ao listar Navios:", err);
      throw err;
    }
  }

  async listaConsolidados() {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .query("SELECT * FROM descarregamento_movimentacao");

      return result.recordset;
    } catch (err) {
      console.error("Erro ao buscar lista consolidada:", err);
      throw err;
    }
  }

  async navioConsolidado(navio) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("navio", sql.VarChar, navio)
        .query(
          "SELECT * FROM descarregamento_movimentacao WHERE navio = @navio"
        );
      return result.recordset;
    } catch (err) {
      console.error("Erro ao buscar navio consolidado:", err);
      throw err;
    }
  }

  async obterDadosParaPrevisao() {
    try {
      const pool = await poolPromise;
      const resultado = await pool
        .request()
        .input("finalizado", sql.Bit, 0)
        .query(
          "SELECT navio, atracacao, saldo, taxa FROM descarregamento_navios WHERE finalizado = @finalizado"
        );

      if (resultado.recordset.length === 0) {
        return null;
      }

      return resultado.recordset[0];
    } catch (err) {
      console.error("Erro ao buscar dados para previsão:", err);
      throw err;
    }
  }

  async atualizarDias(navio, dias) {
    try {
      const pool = await poolPromise;
      await pool
        .request()
        .input("dias", sql.Decimal(5, 2), dias)
        .input("navio", sql.VarChar, navio)
        .query(
          "UPDATE descarregamento_navios SET dias = @dias WHERE navio = @navio"
        );
      return true;
    } catch (err) {
      console.error("Erro ao atualizar dias:", err);
      throw err;
    }
  }

  async atualizaMeta(dados) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("navio", sql.VarChar, dados.navio)
        .input("meta", sql.Float, dados.meta).query(`
        UPDATE descarregamento_navios
        SET
          meta = @meta
        WHERE
          navio = @navio
      `);
      return true;
    } catch (err) {
      console.error("Erro ao atualizar Meta:", err);
      throw err;
    }
  }

  async totalDescarregado(navio, data) {
    try {
      const pool = await poolPromise;
      const request = pool
        .request()
        .input("navio", sql.VarChar, navio)
        .input("data", sql.VarChar, data);

      const resultadoDescarregado = await request.query(`
      SELECT 
        ISNULL(SUM(realizado), 0) AS total
      FROM descarregamento_planejamento
      WHERE navio = @navio
    `);

      const resultadoUltimoDia = await request.query(`
      SELECT 
        realizado AS total
      FROM descarregamento_planejamento
      WHERE 
        navio = @navio 
        AND data = @data
    `);

      const totalDescarregado = resultadoDescarregado.recordset[0]?.total;
      const totalUltimoDia = resultadoUltimoDia.recordset[0]?.total || 0;

      return { totalDescarregado, totalUltimoDia };
    } catch (err) {
      console.error("Erro ao calcular o descarregado:", err);
      throw err;
    }
  }

  async incrementoNavioPilha(dados) {
    try {
      const pool = await poolPromise;
      const { navio, pilha, valorFinalDia, cliente } = dados;

      const search = await pool
        .request()
        .input("navio", sql.VarChar, navio)
        .input("pilha", sql.VarChar, pilha).query(`
        SELECT * FROM 
          descarregamento_navio_pilha
        WHERE
          navio = @navio
        AND
          pilha = @pilha;
      `);

      if (search.recordset.length === 0) {
        await pool
          .request()
          .input("navio", sql.VarChar, navio)
          .input("pilha", sql.VarChar, pilha)
          .input("cliente", sql.VarChar, cliente)
          .input("valorFinalDia", sql.Decimal(10, 3), valorFinalDia).query(`
          INSERT INTO descarregamento_navio_pilha (navio, pilha, volume, cliente)
          VALUES (@navio, @pilha, @valorFinalDia, @cliente);
        `);
      } else {
        await pool
          .request()
          .input("navio", sql.VarChar, navio)
          .input("pilha", sql.VarChar, pilha)
          .input("cliente", sql.VarChar, cliente)
          .input("valorFinalDia", sql.Decimal(9, 2), valorFinalDia).query(`
        UPDATE descarregamento_navio_pilha
        SET
          volume = volume + @valorFinalDia
        WHERE
          navio = @navio
        AND
          pilha = @pilha;
      `);
      }

      return true;
    } catch (err) {
      console.error("Erro ao atualizar estoque por pilha:", err);
      throw err;
    }
  }

  async atualizaArqueacao(dados) {
    try {
      const pool = await poolPromise;
      const { navio, data, arqueado, valorFinalDia, taxa, saldo } = dados;

      const resultUpdate = await pool
        .request()
        .input("navio", sql.VarChar, navio)
        .input("data", sql.Date, data)
        .input("valorFinalDia", sql.Decimal(10, 3), valorFinalDia).query(`
        UPDATE descarregamento_planejamento
        SET
          realizado = @valorFinalDia
        WHERE
          navio = @navio
        AND
          data = @data;
      `);

      if (resultUpdate.rowsAffected[0] === 0) {
        await pool
          .request()
          .input("navio", sql.VarChar, navio)
          .input("data", sql.Date, data)
          .input("arqueado", sql.Decimal(10, 3), arqueado).query(`
          INSERT INTO descarregamento_planejamento (navio, data, planejado, realizado)
          VALUES (@navio, @data, NULL, @arqueado);
        `);
      }

      await pool
        .request()
        .input("taxa", sql.Decimal(10, 0), taxa)
        .input("navio", sql.VarChar, navio)
        .input("saldo", sql.Decimal(10, 3), saldo).query(`
        UPDATE descarregamento_navios
        SET
          taxa = @taxa,
          saldo = @saldo
        WHERE
          navio = @navio;
      `);

      return true;
    } catch (err) {
      console.error("Erro ao inserir Arqueação:", err);
      throw err;
    }
  }

  async obterTempoOperacao(navio) {
    try {
      const pool = await poolPromise;
      const resultadoTempo = await pool
        .request()
        .input("navio", sql.VarChar, navio).query(`
        SELECT 
          SUM(tempo) AS tempo_total
        FROM descarregamento_ocorrencias
        WHERE 
          navio = @navio 
          AND resumo = 'DESCARREGAMENTO'
      `);

      const tempoTotal = resultadoTempo.recordset[0].tempo_total;
      return tempoTotal || 0;
    } catch (err) {
      console.error("Erro ao obter tempo de operação:", err);
      throw err;
    }
  }

  async finalArqueacao(navio, data, volume) {
    try {
      const pool = await poolPromise;
      const resultUpdate = await pool
        .request()
        .input("navio", sql.VarChar, navio)
        .input("data", sql.Date, data)
        .input("volumeDoDia", sql.Decimal(10, 3), volume).query(`
        UPDATE descarregamento_planejamento
        SET
          realizado = @volumeDoDia
        WHERE
          navio = @navio
        AND
          data = @data;
      `);

      if (resultUpdate.rowsAffected[0] === 0) {
        await pool
          .request()
          .input("navio", sql.VarChar, navio)
          .input("data", sql.Date, data)
          .input("volumeDoDia", sql.Decimal(10, 3), volume).query(`
          INSERT INTO descarregamento_planejamento (navio, data, planejado, realizado)
          VALUES (@navio, @data, NULL, @volumeDoDia);
        `);
      }

      return true;
    } catch (err) {
      console.error("Erro ao obter tempo de operação:", err);
      throw err;
    }
  }

  async finalizar(dados) {
    try {
      const pool = await poolPromise;
      await pool
        .request()
        .input("navio", sql.VarChar, dados.navio)
        .input("cliente", sql.VarChar, dados.cliente)
        .input("carvao_tipo", sql.VarChar, dados.carvao_tipo)
        .input("atracacao", sql.DateTime, dados.atracacao)
        .input("desatracacao", sql.DateTime, dados.desatracacao)
        .input("inicio_op", sql.DateTime, dados.inicio_op)
        .input("fim_op", sql.DateTime, dados.fim_op)
        .input("arqueacao_inicial", sql.Float, dados.arqueacao_inicial)
        .input("arqueacao_final", sql.Float, dados.arqueacao_final)
        .input("saldo", sql.Float, 0)
        .input("taxa", sql.Float, dados.taxa)
        .input("taxa_efetiva", sql.Float, dados.taxa_efetiva)
        .input("dias", sql.Decimal(5, 2), dados.dias)
        .input("finalizado", sql.Bit, dados.finalizado).query(`
        UPDATE descarregamento_navios
        SET
          cliente = @cliente,
          carvao_tipo = @carvao_tipo,
          atracacao = @atracacao,
          desatracacao = @desatracacao,
          inicio_op = @inicio_op,
          fim_op = @fim_op,
          arqueacao_inicial = @arqueacao_inicial,
          arqueacao_final = @arqueacao_final,
          saldo = @saldo,
          taxa = @taxa,
          taxa_efetiva = @taxa_efetiva,
          dias = @dias,
          finalizado = @finalizado
        WHERE
          navio = @navio
      `);

      return true;
    } catch (err) {
      console.error("Erro ao finalizar navio:", err);
      throw err;
    }
  }

  async inforFinalNavio(navio) {
    try {
      const pool = await poolPromise;
      const resultado = await pool
        .request()
        .input("navio", sql.VarChar, navio)
        .query(
          "SELECT taxa, taxa_efetiva, meta FROM descarregamento_navios WHERE navio = @navio"
        );

      if (resultado.recordset.length === 0) {
        return null;
      }

      return resultado.recordset[0];
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
      throw err;
    }
  }

  async consolidar(dados) {
    try {
      const pool = await poolPromise;
      await pool
        .request()
        .input("navio", sql.VarChar, dados.navio)
        .input("cliente", sql.VarChar, dados.cliente)
        .input("sistema", sql.VarChar, dados.sistema)
        .input("nor", sql.DateTime, dados.nor)
        .input("atracacao", sql.DateTime, dados.atracacao)
        .input("desatracacao", sql.DateTime, dados.desatracacao)
        .input("inicio_operacao", sql.DateTime, dados.inicio_operacao)
        .input("fim_operacao", sql.DateTime, dados.fim_operacao)
        .input("dias_operando", sql.Decimal(5, 2), dados.dias_operando)
        .input("dias_atracado", sql.Decimal(5, 2), dados.dias_atracado)
        .input("dias_base_75k", sql.Decimal(5, 2), dados.dias_base_75k)
        .input("carga", sql.Float, dados.carga)
        .input("produtividade", sql.Float, dados.produtividade)
        .input("dias_de_demurrage", sql.Float, dados.dias_de_demurrage)
        .input("valor_demurrage_USD", sql.Float, dados.valor_demurrage_USD)
        .input(
          "demurrage_ou_despatch_aproximado",
          sql.Float,
          dados.demurrage_ou_despatch_aproximado
        )
        .input("carvao_tipo", sql.VarChar, dados.carvao_tipo)
        .input("taxa_comercial", sql.Float, dados.taxa_comercial)
        .input("taxa_efetiva", sql.Float, dados.taxa_efetiva)
        .input("meta", sql.Float, dados.meta)
        .input("observacao", sql.VarChar, dados.observacao).query(`
          INSERT INTO descarregamento_movimentacao (
            navio,
            cliente,
            sistema,
            nor,
            atracacao,
            desatracacao,
            inicio_operacao,
            fim_operacao,
            dias_operando,
            dias_atracado,
            dias_base_75k,
            carga,
            produtividade,
            dias_de_demurrage,
            valor_demurrage_USD,
            demurrage_ou_despatch_aproximado,
            carvao_tipo,
            taxa_comercial,
            taxa_efetiva,  
            meta,          
            observacao
          )
          VALUES (
            @navio,
            @cliente,
            @sistema,
            @nor,
            @atracacao,
            @desatracacao,
            @inicio_operacao,
            @fim_operacao,
            @dias_operando,
            @dias_atracado,
            @dias_base_75k,
            @carga,
            @produtividade,
            @dias_de_demurrage,
            @valor_demurrage_USD,
            @demurrage_ou_despatch_aproximado,
            @carvao_tipo,
            @taxa_comercial,
            @taxa_efetiva,  
            @meta,          
            @observacao
          )
        `);
      return true;
    } catch (err) {
      console.error("Erro ao consolidar navio:", err);
      throw err;
    }
  }

  async pilhas() {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .query("SELECT * FROM descarregamento_navio_pilha WHERE volume > 0");
      return result.recordset;
    } catch (err) {
      console.error("Erro ao buscar pilhas:", err);
      throw err;
    }
  }

  async buscarNavioAtracado() {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("finalizado", sql.Bit, 0)
        .query(
          "SELECT * FROM descarregamento_navios WHERE finalizado = @finalizado"
        );
      return result.recordset;
    } catch (err) {
      console.error("Erro ao buscar Navio:", err);
      throw err;
    }
  }

  async buscarOciosidade() {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .query(
          "SELECT TOP 20 * FROM descarregamento_ocorrencias ORDER BY inicio DESC"
        );
      return result.recordset;
    } catch (err) {
      console.error("Erro ao buscar ociosidade:", err);
      throw err;
    }
  }

  async ocorrenciasNavioAtracado(navio) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("navio", sql.VarChar, navio)
        .query(
          "SELECT * FROM descarregamento_ocorrencias WHERE navio = @navio ORDER BY inicio ASC"
        );
      return result.recordset;
    } catch (err) {
      console.error("Erro ao buscar Navio:", err);
      throw err;
    }
  }

  async buscarTopOpe(navio, especialidade, classificacaoExcluida) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("navio", sql.VarChar, navio)
        .input("especialidade", sql.VarChar, especialidade)
        .input("classificacaoExcluida", sql.VarChar, classificacaoExcluida)
        .query(
          `
          SELECT TOP 10
            resumo AS ocorrencia, 
            SUM(tempo) AS tempo 
          FROM 
            descarregamento_ocorrencias 
          WHERE 
            navio = @navio 
            AND especialidade = @especialidade 
            AND classificacao <> @classificacaoExcluida
          GROUP BY 
            resumo
          ORDER BY 
            tempo DESC
        `
        );
      return result.recordset;
    } catch (err) {
      console.error("Erro ao buscar Top10 Operação:", err);
      throw err;
    }
  }

  async buscarTopMan(navio) {
    try {
      const pool = await poolPromise;
      const request = pool
        .request()
        .input("navio", sql.VarChar, navio)
        .input("corretiva", sql.VarChar, "MANUTENÇÃO CORRETIVA")
        .input("preventiva", sql.VarChar, "MANUTENÇÃO PREVENTIVA");

      const result = await request.query(
        `
        SELECT TOP 10
          CAST(ocorrencia AS NVARCHAR(MAX)) AS ocorrencia,
          SUM(tempo) AS tempo 
        FROM 
          descarregamento_ocorrencias 
        WHERE 
          navio = @navio 
          AND (classificacao = @corretiva OR classificacao = @preventiva)
        GROUP BY 
          CAST(ocorrencia AS NVARCHAR(MAX))
        ORDER BY 
          tempo DESC
      `
      );
      return result.recordset;
    } catch (err) {
      console.error("Erro ao buscar Top10 Operação:", err);
      throw err;
    }
  }

  async buscarOcorrenciaGeral() {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .query("SELECT * FROM descarregamento_ocorrencias ORDER BY inicio ASC");
      return result.recordset;
    } catch (err) {
      console.error("Erro ao buscar ocorrências:", err);
      throw err;
    }
  }

  async atualizarOcorrenciaSimples(dados, id) {
    const query = `
    UPDATE descarregamento_ocorrencias
    SET 
      ocorrencia = @ocorrencia,
      resumo = @resumo,
      sistema = @sistema,
      subsistema = @subsistema,
      classificacao = @classificacao,
      especialidade = @especialidade,
      tipo_desligamento = @tipo_desligamento
    WHERE id = @id
  `;

    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("ocorrencia", sql.VarChar, dados.ocorrencia)
        .input("resumo", sql.VarChar, dados.resumo)
        .input("sistema", sql.VarChar, dados.sistema)
        .input("subsistema", sql.VarChar, dados.subsistema)
        .input("classificacao", sql.VarChar, dados.classificacao)
        .input("especialidade", sql.VarChar, dados.especialidade)
        .input("tipo_desligamento", sql.VarChar, dados.tipo_desligamento)
        .input("id", sql.Int, id)
        .query(query);

      return result;
    } catch (err) {
      console.error("Erro ao atualizar ocorrência:", err);
      throw err;
    }
  }

  async buscarUltima() {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(`
      SELECT TOP 1 * FROM descarregamento_ocorrencias ORDER BY fim DESC;
    `);

      return result.recordset[0];
    } catch (err) {
      console.error("Erro ao buscar a última ocorrência:", err);
      throw err;
    }
  }

  async adicionarOcorrencia(dados) {
    const query = `
        INSERT INTO descarregamento_ocorrencias
        (navio, cliente, inicio, fim, ocorrencia, resumo, sistema, subsistema, classificacao, especialidade, tipo_desligamento, tempo)
        VALUES (@navio, @cliente, @inicio, @fim, @ocorrencia, @resumo, @sistema, @subsistema, @classificacao, @especialidade, @tipo_desligamento, @tempo)
    `;
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("navio", sql.VarChar, dados.navio)
        .input("cliente", sql.VarChar, dados.cliente)
        .input("inicio", sql.DateTime, dados.inicio)
        .input("fim", sql.DateTime, dados.fim)
        .input("ocorrencia", sql.Text, dados.ocorrencia)
        .input("resumo", sql.VarChar, dados.resumo)
        .input("sistema", sql.VarChar, dados.sistema)
        .input("subsistema", sql.VarChar, dados.subsistema)
        .input("classificacao", sql.VarChar, dados.classificacao)
        .input("especialidade", sql.VarChar, dados.especialidade)
        .input("tipo_desligamento", sql.VarChar, dados.tipo_desligamento)
        .input("tempo", sql.Decimal(5, 2), dados.tempo)
        .query(query);

      return result;
    } catch (err) {
      console.error("Erro ao adicionar ocorrência:", err);
      throw err;
    }
  }

  async adicionarPlano(dados) {
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("navio", sql.VarChar, dados.navio)
        .input("data", sql.Date, dados.data)
        .input("planejado", sql.Decimal(10, 2), dados.planejado)
        .input("realizado", sql.Decimal(10, 2), dados.realizado).query(`
        INSERT INTO descarregamento_planejamento
        (navio, data, planejado, realizado)
        VALUES (@navio, @data, @planejado, @realizado)
      `);

      return result;
    } catch (err) {
      console.error("Erro ao adicionar item do Plano:", err);
      throw err;
    }
  }

  async atualizarOcorrencia(dados) {
    const id = dados.id;
    const query = `
    UPDATE descarregamento_ocorrencias
    SET
      navio = @navio,
      cliente = @cliente,
      inicio = @inicio,
      fim = @fim,
      ocorrencia = @ocorrencia,
      resumo = @resumo,
      sistema = @sistema,
      subsistema = @subsistema,
      classificacao = @classificacao,
      especialidade = @especialidade,
      tipo_desligamento = @tipo_desligamento,
      tempo = @tempo
    WHERE id = @id; 
  `;
    try {
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input("id", sql.Int, id)
        .input("navio", sql.VarChar, dados.navio)
        .input("cliente", sql.VarChar, dados.cliente)
        .input("inicio", sql.DateTime, dados.inicio)
        .input("fim", sql.DateTime, dados.fim)
        .input("ocorrencia", sql.Text, dados.ocorrencia)
        .input("resumo", sql.VarChar, dados.resumo)
        .input("sistema", sql.VarChar, dados.sistema)
        .input("subsistema", sql.VarChar, dados.subsistema)
        .input("classificacao", sql.VarChar, dados.classificacao)
        .input("especialidade", sql.VarChar, dados.especialidade)
        .input("tipo_desligamento", sql.VarChar, dados.tipo_desligamento)
        .input("tempo", sql.Decimal(5, 2), dados.tempo)
        .query(query);

      return result;
    } catch (err) {
      console.error("Erro ao atualizar ocorrência:", err);
      throw err;
    }
  }

  async buscarLista() {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(`
      SELECT ocorrencia , aplicacoes  FROM descarregamento_lista_ocorrencias
    `);
      const listaFormatada = {};
      result.recordset.forEach((row) => {
        try {
          const dadosJson = JSON.parse(row.aplicacoes);
          listaFormatada[row.ocorrencia] = Array.isArray(dadosJson)
            ? dadosJson
            : [];
        } catch (err) {
          console.error("Erro ao parsear JSON:", err);
          listaFormatada[row.ocorrencia] = [];
        }
      });

      return listaFormatada;
    } catch (err) {
      console.error("Erro ao buscar lista de ocorrências:", err);
      throw err;
    }
  }

  async buscarPlano(navio) {
    try {
      const pool = await poolPromise;
      const result = await pool.request().input("navio", sql.VarChar, navio)
        .query(`
        SELECT 
          *
        FROM descarregamento_planejamento
        WHERE 
          navio = @navio
        ORDER BY data ASC
      `);
      return result.recordset;
    } catch (err) {
      console.error("Erro ao buscar Plano de Descarga:", err);
      throw err;
    }
  }

  async paretoOperacao(navio) {
    try {
      const pool = await poolPromise;
      const result = await pool.request().input("navio", sql.VarChar, navio)
        .query(`
        SELECT 
          resumo,
          SUM(tempo) AS tempo_total
        FROM descarregamento_ocorrencias
        WHERE 
          navio = @navio 
          AND especialidade = 'OPERAÇÃO'
          AND resumo <> 'DESCARREGAMENTO'
        GROUP BY resumo
        ORDER BY tempo_total DESC
      `);
      return result.recordset;
    } catch (err) {
      console.error("Erro ao buscar Pareto OPERAÇÃO:", err);
      throw err;
    }
  }

  async paretoManutencao(navio) {
    try {
      const pool = await poolPromise;
      const result = await pool.request().input("navio", sql.VarChar, navio)
        .query(`
        SELECT 
          resumo,
          SUM(tempo) AS tempo_total
        FROM descarregamento_ocorrencias
        WHERE 
          navio = @navio
          AND especialidade IN ('MAN ELÉTRICA', 'MAN MECÂNICA', 'ENGENHARIA')
        GROUP BY resumo
        ORDER BY tempo_total DESC
      `);
      return result.recordset;
    } catch (err) {
      console.error("Erro ao buscar Pareto MANUTENÇÃO:", err);
      throw err;
    }
  }

  async cascataEventos(navio) {
    try {
      const pool = await poolPromise;
      const result = await pool.request().input("navio", sql.VarChar, navio)
        .query(`
        SELECT classificacao, SUM(tempo) AS tempo_total
        FROM descarregamento_ocorrencias
        WHERE navio = @navio
          AND classificacao IN (
            'CONDIÇÃO CLIMÁTICA',
            'DESCARREGANDO',
            'MANUTENÇÃO CORRETIVA',
            'MANUTENÇÃO PREVENTIVA',
            'PARADA OPERACIONAL'
          )
        GROUP BY classificacao
      `);
      return result.recordset;
    } catch (err) {
      console.error("Erro ao buscar eventos resumo:", err);
      throw err;
    }
  }

  async corretivPreventiva(navio) {
    try {
      const pool = await poolPromise;
      const result = await pool.request().input("navio", sql.VarChar, navio)
        .query(`
        SELECT sistema, classificacao, SUM(tempo) AS tempo
        FROM descarregamento_ocorrencias
        WHERE navio = @navio
          AND classificacao IN ('MANUTENÇÃO CORRETIVA', 'MANUTENÇÃO PREVENTIVA')
        GROUP BY sistema, classificacao
      `);

      const dados = result.recordset;

      const mapa = {};

      dados.forEach(({ sistema, classificacao, tempo }) => {
        if (!mapa[sistema]) {
          mapa[sistema] = { nome: sistema, corretiva: 0, preventiva: 0 };
        }
        if (classificacao === "MANUTENÇÃO CORRETIVA") {
          mapa[sistema].corretiva = Number(tempo);
        } else if (classificacao === "MANUTENÇÃO PREVENTIVA") {
          mapa[sistema].preventiva = Number(tempo);
        }
      });

      return Object.values(mapa);
    } catch (err) {
      console.error("Erro ao buscar dados de manutenção:", err);
      throw err;
    }
  }
}

module.exports = new NavioModel();
