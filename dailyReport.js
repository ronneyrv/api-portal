const cron = require('node-cron');
const nodemailer = require('nodemailer');
const ExcelJS = require('exceljs');
require('dotenv').config();

// 1. Importando a conexão do seu padrão existente
const { poolPromise } = require("./infraestrutura/conexao");

// 2. Configuração do Outlook 365
const transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false, 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        ciphers: 'SSLv3'
    }
});

async function gerarEEnviarRelatorio() {
    try {
        console.log("🔄 Iniciando geração de relatório de estoque...");

        // 3. Aguarda o pool de conexão que já existe na sua infraestrutura
        const pool = await poolPromise;

        // Query solicitada: TOP 30, colunas específicas, ordenado por data
        const result = await pool.request().query(`
            SELECT TOP 30
                dia, 
                tcld_ep, tcld_eneva, 
                rodoviario_ep, rodoviario_eneva, 
                emprestimo_ep, emprestimo_eneva, 
                ajuste_ep, ajuste_eneva, 
                consumo_ug1, consumo_ug2, consumo_ug3, 
                volume_ep, volume_eneva, volume_conjunto, 
                dia_ep, dia_eneva, dia_conjunto, 
                comentario
            FROM estoque
            ORDER BY dia DESC
        `);
        
        const dados = result.recordset;
console.log("✅ Dados de estoque recuperados:",dados);
        if (!dados || dados.length === 0) {
            console.log("⚠️ Nenhum dado de estoque encontrado.");
            return;
        }

        // --- Geração do Excel (ExcelJS) ---
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Estoque 30 Dias');

        // Cria colunas dinamicamente com base na query
        const colunas = Object.keys(dados[0]).map(key => ({
            header: key.toUpperCase(),
            key: key,
            width: key === 'comentario' ? 50 : 15 // Coluna de comentário mais larga
        }));
        
        worksheet.columns = colunas;
        worksheet.addRows(dados);
        
        // Estilização do cabeçalho
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }; // Branco
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF0056b3' } // Azul Escuro
        };

        // Formatação da coluna de Data (assumindo que 'dia' é a 1ª coluna)
        worksheet.getColumn(1).numFmt = 'dd/mm/yyyy';

        const excelBuffer = await workbook.xlsx.writeBuffer();
console.log("✅ Relatório de estoque gerado:",excelBuffer);
        // --- Envio do E-mail ---
        // const mailOptions = {
        //     from: `"Portal PPTM" <${process.env.EMAIL_USER}>`,
        //     to: "ronney.rocha@energiapecem.com", // Destinatário principal
        //     subject: `Relatório de Estoque (30 Dias) - ${new Date().toLocaleDateString('pt-BR')}`,
        //     html: `
        //         <div style="font-family: Arial, sans-serif;">
        //             <h2 style="color: #0056b3;">Relatório Diário de Estoque</h2>
        //             <p>Olá,</p>
        //             <p>Segue em anexo o extrato das últimas <b>30 movimentações</b> da tabela de estoque.</p>
        //             <hr>
        //             <p style="font-size: 12px; color: #666;">Enviado automaticamente pelo Portal PPTM.</p>
        //         </div>
        //     `,
        //     attachments: [
        //         {
        //             filename: `Estoque_30dias_${new Date().toISOString().split('T')[0]}.xlsx`,
        //             content: excelBuffer,
        //             contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        //         }
        //     ]
        // };

        //let info = await transporter.sendMail(mailOptions);
        console.log("E-mail enviado com sucesso: %s");

    } catch (error) {
        console.error("Erro ao processar relatório:", error);
    }
}

// Iniciar Agendamento (Cron)
const iniciarAgendamento = () => {
    // Roda todo dia às 10:00 da manhã
    cron.schedule('0 10 * * *', () => {
        console.log("⏰ Executando tarefa agendada: Relatório Estoque");
        gerarEEnviarRelatorio();
    }, {
        scheduled: true,
        timezone: "America/Sao_Paulo"
    });
    
    // Teste imediato (opcional, remova depois):
     //gerarEEnviarRelatorio();
};

module.exports = { iniciarAgendamento };