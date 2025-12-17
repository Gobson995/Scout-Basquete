import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Jogador, LogAcao } from "../types/game";

const formatarData = (dataIso: string) => {
  if (!dataIso) return new Date().toLocaleDateString();
  const [ano, mes, dia] = dataIso.split('-');
  return `${dia}/${mes}/${ano}`;
};

export const gerarPDF = (
  jogadores: Jogador[], 
  logs: LogAcao[], 
  placarMeus: number, 
  placarAdv: number,
  info?: { timeCasa: string; timeAdversario: string; campeonato: string; data: string }
) => {
  const doc = new jsPDF({ orientation: "landscape" });

  doc.setFontSize(18);
  doc.text("Relatório de Jogo - Scout Completo", 14, 20);

  doc.setFontSize(12);
  doc.setTextColor(100);
  
  const campeonato = info?.campeonato || "Amistoso";
  const data = formatarData(info?.data || "");
  const timeCasa = info?.timeCasa || "Meu Time";
  const timeAdv = info?.timeAdversario || "Adversário";

  doc.text(`${campeonato} - ${data}`, 14, 30);
  
  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.text(`${timeCasa}  ${placarMeus}  x  ${placarAdv}  ${timeAdv}`, 14, 40);

  const dadosTabela = jogadores.map(jogador => {
    const logsJ = logs.filter(l => l.jogadorId === jogador.id);

    const att3 = logsJ.filter(l => l.tipo === '3PT').length;
    const made3 = logsJ.filter(l => l.tipo === '3PT' && l.resultado === 'ACERTO').length;
    
    const att2 = logsJ.filter(l => l.tipo === '2PT').length;
    const made2 = logsJ.filter(l => l.tipo === '2PT' && l.resultado === 'ACERTO').length;

    const att1 = logsJ.filter(l => l.tipo === '1PT').length;
    const made1 = logsJ.filter(l => l.tipo === '1PT' && l.resultado === 'ACERTO').length;

    const attFG = att2 + att3;
    const madeFG = made2 + made3;

    const pctFG = attFG > 0 ? Math.round((madeFG / attFG) * 100) : 0;
    const pct3 = att3 > 0 ? Math.round((made3 / att3) * 100) : 0;
    const pct1 = att1 > 0 ? Math.round((made1 / att1) * 100) : 0;

    const strFG = `${madeFG}/${attFG} (${pctFG}%)`;
    const str3PT = `${made3}/${att3} (${pct3}%)`;
    const strLL = `${made1}/${att1} (${pct1}%)`;

    const rebDef = logsJ.filter(l => l.tipo === 'REBOTE_DEF').length;
    const rebOf = logsJ.filter(l => l.tipo === 'REBOTE_OF').length;
    const ast = logsJ.filter(l => l.tipo === 'ASSISTENCIA').length;
    const rou = logsJ.filter(l => l.tipo === 'ROUBO').length;
    const toc = logsJ.filter(l => l.tipo === 'TOCO').length;
    const err = logsJ.filter(l => l.tipo === 'TURNOVER').length;
    const fal = logsJ.filter(l => l.tipo === 'FALTA').length;

    const calcPontosPeriodo = (p: number) => {
        const logsP = logsJ.filter(l => l.periodo === p && l.resultado === 'ACERTO');
        return logsP.reduce((acc, curr) => {
            if (curr.tipo === '3PT') return acc + 3;
            if (curr.tipo === '2PT') return acc + 2;
            return acc + 1;
        }, 0);
    };

    const q1 = calcPontosPeriodo(1);
    const q2 = calcPontosPeriodo(2);
    const q3 = calcPontosPeriodo(3);
    const q4 = calcPontosPeriodo(4);

    const totalPontos = (made3 * 3) + (made2 * 2) + made1;

    return [
      `#${jogador.numero} ${jogador.nome}`,
      totalPontos,
      strFG,
      str3PT,
      strLL,
      rebDef,
      rebOf,
      ast,
      rou,
      toc,
      err,
      fal,
      q1, q2, q3, q4
    ];
  });

  autoTable(doc, {
    startY: 50,
    head: [[
        'Jogador', 'PTS', 'FG (2+3)', '3 Pts', 'LL (1pt)', 
        'RD', 'RO', 'AST', 'ROU', 'TOC', 'ER', 'F', 
        'Q1', 'Q2', 'Q3', 'Q4'
    ]],
    body: dadosTabela,
    theme: 'grid',
    headStyles: { 
        fillColor: [41, 128, 185], 
        halign: 'center',
        fontSize: 8 
    },
    styles: { 
        fontSize: 8,
        cellPadding: 2, 
        halign: 'center' 
    },
    columnStyles: {
      0: { fontStyle: 'bold', halign: 'left', cellWidth: 35 },
      2: { cellWidth: 22 },
      3: { cellWidth: 22 },
      4: { cellWidth: 22 }
    }
  });

  doc.save(`scout_completo_${new Date().getTime()}.pdf`);
};