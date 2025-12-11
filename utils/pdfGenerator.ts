import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Jogador, LogAcao } from "@/types/game";
import { calcularEstatisticas, calcularPontosPorQuarto } from "./statistics";

export function gerarPDF(jogadores: Jogador[], logs: LogAcao[], placarMeus: number, placarAdv: number) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Relatório de Jogo - Scout Basquete", 14, 20);
  
  doc.setFontSize(12);
  doc.text(`Placar Final: Meu Time ${placarMeus} x ${placarAdv} Adversário`, 14, 30);
  doc.text(`Data: ${new Date().toLocaleDateString()}`, 14, 36);

  const dadosTabela = jogadores.map(jogador => {
    const s = calcularEstatisticas(jogador, logs);
    const q = calcularPontosPorQuarto(jogador, logs);
    
    const fgPct = s.fgAttempt > 0 ? Math.round((s.fgMade / s.fgAttempt) * 100) : 0;
    const threePct = s.threeAttempt > 0 ? Math.round((s.threeMade / s.threeAttempt) * 100) : 0;
    const ftPct = s.ftAttempt > 0 ? Math.round((s.ftMade / s.ftAttempt) * 100) : 0;

    return [
      `#${s.numero} ${s.nome}`,
      s.pontos,
      `${s.fgMade}/${s.fgAttempt} (${fgPct}%)`,
      `${s.threeMade}/${s.threeAttempt} (${threePct}%)`,
      `${s.ftMade}/${s.ftAttempt} (${ftPct}%)`,
      s.rebotes,
      s.assistencias,
      s.faltas,
      q[1], q[2], q[3], q[4]
    ];
  });

  autoTable(doc, {
    startY: 45,
    head: [[
      "Jogador", "PTS", "FG (Geral)", "3 Pontos", "L. Livre", "REB", "AST", "F", "1º", "2º", "3º", "4º"
    ]],
    body: dadosTabela,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [41, 128, 185] },
    columnStyles: {
      0: { fontStyle: 'bold' }
    }
  });

  const pageCount = doc.getNumberOfPages();
  doc.setFontSize(8);
  for(let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text('Gerado via Scout Basquete App', 14, doc.internal.pageSize.height - 10);
  }

  doc.save(`scout_basquete_${Date.now()}.pdf`);
}