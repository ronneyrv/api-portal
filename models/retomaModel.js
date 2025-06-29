const conexao = require("../infraestrutura/conexao");

class RetomaModel {
  listar(data, turno) {
    const sql = "SELECT * FROM realRetoma WHERE data = ? AND turno = ?";

    return new Promise((resolve, reject) => {
      conexao.query(sql, [data, turno], async (err, result) => {
        if (err) {
          console.error("Erro ao buscar retoma:", err);
          reject(err);
        }
        resolve(result);
      });
    });
  }
}

module.exports = new RetomaModel();

//Com chave primaria composta (dia, semana) no banco

// const { poolPromise, sql } = require("../infraestrutura/conexao");

// class ProgRetomaModel {
//   async listar(semana) {
//     try {
//       const pool = await poolPromise;
//       const result = await pool
//         .request()
//         .input("semana", sql.VarChar, semana)
//         .query("SELECT * FROM progRetoma WHERE semana = @semana");

//       return result.recordset;
//     } catch (err) {
//       console.error("Erro ao buscar programação:", err);
//       throw err;
//     }
//   }

//   async add(dados) {
//     try {
//       const pool = await poolPromise;

//       const request = pool.request()
//         .input("dia", sql.VarChar, dados.dia)
//         .input("semana", sql.VarChar, dados.semana)
//         .input("maquina_ug1", sql.VarChar, dados.maquina_ug1)
//         .input("pilha_ug1", sql.VarChar, dados.pilha_ug1)
//         .input("navio_ug1", sql.VarChar, dados.navio_ug1)
//         .input("obs_ug1", sql.VarChar, dados.obs_ug1)
//         .input("maquina_ug2", sql.VarChar, dados.maquina_ug2)
//         .input("pilha_ug2", sql.VarChar, dados.pilha_ug2)
//         .input("navio_ug2", sql.VarChar, dados.navio_ug2)
//         .input("obs_ug2", sql.VarChar, dados.obs_ug2)
//         .input("maquina_ug3", sql.VarChar, dados.maquina_ug3)
//         .input("pilha_ug3", sql.VarChar, dados.pilha_ug3)
//         .input("navio_ug3", sql.VarChar, dados.navio_ug3)
//         .input("obs_ug3", sql.VarChar, dados.obs_ug3)
//         .input("maquina_empilha", sql.VarChar, dados.maquina_empilha)
//         .input("pilha_empilha", sql.VarChar, dados.pilha_empilha)
//         .input("navio_empilha", sql.VarChar, dados.navio_empilha)
//         .input("obs_empilha", sql.VarChar, dados.obs_empilha);

//       const sqlMerge = `
//         MERGE progRetoma AS target
//         USING (SELECT 
//             @dia AS dia, @semana AS semana
//         ) AS source
//         ON (target.dia = source.dia AND target.semana = source.semana)
//         WHEN MATCHED THEN 
//           UPDATE SET 
//             maquina_ug1 = @maquina_ug1, pilha_ug1 = @pilha_ug1, navio_ug1 = @navio_ug1, obs_ug1 = @obs_ug1,
//             maquina_ug2 = @maquina_ug2, pilha_ug2 = @pilha_ug2, navio_ug2 = @navio_ug2, obs_ug2 = @obs_ug2,
//             maquina_ug3 = @maquina_ug3, pilha_ug3 = @pilha_ug3, navio_ug3 = @navio_ug3, obs_ug3 = @obs_ug3,
//             maquina_empilha = @maquina_empilha, pilha_empilha = @pilha_empilha, navio_empilha = @navio_empilha, obs_empilha = @obs_empilha
//         WHEN NOT MATCHED THEN 
//           INSERT (
//             dia, semana,
//             maquina_ug1, pilha_ug1, navio_ug1, obs_ug1,
//             maquina_ug2, pilha_ug2, navio_ug2, obs_ug2,
//             maquina_ug3, pilha_ug3, navio_ug3, obs_ug3,
//             maquina_empilha, pilha_empilha, navio_empilha, obs_empilha
//           ) VALUES (
//             @dia, @semana,
//             @maquina_ug1, @pilha_ug1, @navio_ug1, @obs_ug1,
//             @maquina_ug2, @pilha_ug2, @navio_ug2, @obs_ug2,
//             @maquina_ug3, @pilha_ug3, @navio_ug3, @obs_ug3,
//             @maquina_empilha, @pilha_empilha, @navio_empilha, @obs_empilha
//           );
//       `;

//       const result = await request.query(sqlMerge);
//       return result;
//     } catch (err) {
//       console.error("Erro ao adicionar/atualizar programação:", err);
//       throw err;
//     }
//   }
// }

// module.exports = new ProgRetomaModel();
