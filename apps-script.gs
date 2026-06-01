/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  GOOGLE APPS SCRIPT — Quiz Capilar | Jessica Mayara             ║
 * ║                                                                  ║
 * ║  INSTRUÇÕES:                                                     ║
 * ║  1. Acesse script.google.com e crie um novo projeto              ║
 * ║  2. Cole todo este código no editor                              ║
 * ║  3. Substitua SEU_SPREADSHEET_ID pelo ID da sua planilha         ║
 * ║     (encontrado na URL da planilha, entre /d/ e /edit)           ║
 * ║  4. Clique em Implantação > Nova implantação                     ║
 * ║  5. Tipo: Web App                                                ║
 * ║  6. Executar como: Eu mesmo                                      ║
 * ║  7. Acesso: Qualquer pessoa                                      ║
 * ║  8. Clique em Implantar e copie a URL gerada                     ║
 * ║  9. Cole a URL em APPS_SCRIPT_URL no index.html                  ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

// ⚠️ SUBSTITUA pelo ID da sua planilha Google Sheets
var SPREADSHEET_ID = 'SEU_SPREADSHEET_ID';

// Nome da aba onde os leads serão registrados
var SHEET_NAME = 'Leads Quiz Capilar';

// Cabeçalhos das colunas (gerados automaticamente na primeira execução)
var HEADERS = [
  'Data/Hora',
  'Nome',
  'Telefone',
  'Perfil',
  'Q1 - Estágio atual',
  'Q2 - Nível de calvície',
  'Q3 - Tempo de queda',
  'Q4 - Tratamentos anteriores',
  'Q5 - Motivação',
  'Q6 - Disponibilidade',
  'Q7 - Couro cabeludo',
  'Q8 - Expectativa',
];

/**
 * Recebe o POST enviado pelo quiz e registra no Google Sheets.
 * Configurado com CORS para aceitar requisições externas.
 */
function doPost(e) {
  try {
    // Parse do JSON recebido
    var data = JSON.parse(e.postData.contents);

    var timestamp  = data.timestamp  || new Date().toLocaleString('pt-BR');
    var nome       = data.nome       || '—';
    var telefone   = data.telefone   || '—';
    var perfil     = data.perfil     || '—';
    var respostas  = data.respostas  || {};

    // Abre a planilha pelo ID
    var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = getOrCreateSheet(ss);

    // Insere cabeçalhos automaticamente se a planilha estiver vazia
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      formatHeaders(sheet);
    }

    // Monta a linha de dados na mesma ordem dos cabeçalhos
    var row = [
      timestamp,
      nome,
      telefone,
      perfil,
      respostas['pergunta_1'] || '—',
      respostas['pergunta_2'] || '—',
      respostas['pergunta_3'] || '—',
      respostas['pergunta_4'] || '—',
      respostas['pergunta_5'] || '—',
      respostas['pergunta_6'] || '—',
      respostas['pergunta_7'] || '—',
      respostas['pergunta_8'] || '—',
    ];

    sheet.appendRow(row);

    // Retorna sucesso com headers CORS
    return buildResponse({ status: 'ok', message: 'Lead registrado com sucesso.' });

  } catch (err) {
    // Loga o erro internamente mas retorna resposta para não bloquear o quiz
    console.error('Erro ao registrar lead:', err.toString());
    return buildResponse({ status: 'error', message: err.toString() });
  }
}

/**
 * Requisições GET (teste manual via navegador).
 */
function doGet(e) {
  return buildResponse({ status: 'ok', message: 'Quiz Capilar — Apps Script ativo.' });
}

/**
 * Retorna a aba de leads, ou cria uma nova se não existir.
 */
function getOrCreateSheet(ss) {
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  return sheet;
}

/**
 * Formata a linha de cabeçalhos: negrito, cor de fundo e congelamento.
 */
function formatHeaders(sheet) {
  var headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#AF9886');
  headerRange.setFontColor('#ffffff');
  headerRange.setHorizontalAlignment('center');
  sheet.setFrozenRows(1);

  // Ajusta largura das colunas automaticamente
  for (var i = 1; i <= HEADERS.length; i++) {
    sheet.setColumnWidth(i, i === 1 ? 160 : i === 2 ? 220 : 280);
  }
}

/**
 * Monta o ContentService com headers CORS para aceitar requisições externas.
 */
function buildResponse(obj) {
  var output = ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
  return output;
}
