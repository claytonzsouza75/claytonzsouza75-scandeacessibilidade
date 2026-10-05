import React from 'react';
import { UserCheck, ShieldAlert, Video, MessageSquare, Keyboard, Eye, HelpCircle } from 'lucide-react';

export const ManualReviewGuide: React.FC = () => {
  const manualCheckpoints = [
    {
      id: 'libras',
      icon: MessageSquare,
      title: 'Tradução em Libras (Língua Brasileira de Sinais)',
      whyManual: 'A automação consegue detectar a presença de plugins ou vídeos, mas não avalia a qualidade da interpretação em Libras ou a naturalidade dos avatares 3D.',
      howToTest: 'Convide pessoas surdas usuárias de Libras para avaliar se a tradução é clara e se os termos técnicos foram transmitidos com precisão.',
    },
    {
      id: 'audiodescricao',
      icon: Video,
      title: 'Audiodescrição em Vídeos e Imagens Complexas',
      whyManual: 'Sistemas automáticos não conseguem julgar se a narração de um vídeo descreve expressões faciais, gráficos estatísticos e ações visuais importantes que não têm fala.',
      howToTest: 'Assista aos vídeos de olhos vendados ou ouvindo apenas a faixa de áudio e confirme se todas as informações visuais foram narradas.',
    },
    {
      id: 'legenda-qualidade',
      icon: Eye,
      title: 'Sincronia e Qualidade das Legendas (Closed Captions)',
      whyManual: 'Legendas geradas automaticamente por IA frequentemente contêm erros ortográficos graves em nomes próprios, termos médicos ou jargões técnicos.',
      howToTest: 'Revise manualmente se as legendas estão pontuadas corretamente, sincronizadas com os diálogos e se identificam a mudança de quem está falando.',
    },
    {
      id: 'teclado-fluxo',
      icon: Keyboard,
      title: 'Navegação Completa por Teclado e Armadilhas de Foco',
      whyManual: 'Apenas testes dinâmicos com navegação real (tecla Tab, Shift+Tab, Enter, Esc e setas) revelam se existem "armadilhas de foco" em modais ou submenus.',
      howToTest: 'Desconecte o mouse e navegue por todo o fluxo de compra, cadastro ou leitura usando apenas o teclado. Verifique se o foco nunca fica preso ou invisível.',
    },
    {
      id: 'contexto-semantico',
      icon: HelpCircle,
      title: 'Fidelidade e Significado do Alt-Text',
      whyManual: 'Um alt-text pode ser sintaticamente válido (não vazio), mas não comunicar o sentido pretendido pelo autor editorial da página.',
      howToTest: 'Verifique se a descrição da imagem adiciona o valor que uma pessoa com visão comum extrai ao olhar para a imagem naquele contexto.',
    },
    {
      id: 'usuarios-reais',
      icon: UserCheck,
      title: 'Testes de Usabilidade com Pessoas com Deficiência (PcD)',
      whyManual: 'Nenhuma ferramenta automatizada substitui a experiência vivida por pessoas cegas, com baixa visão, mobilidade reduzida, surdez ou neurodivergência.',
      howToTest: 'Estruture sessões periódicas de testes de usabilidade com pessoas com diferentes deficiências utilizando suas próprias tecnologias assistivas.',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
      <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
          <UserCheck className="w-5 h-5 text-sky-600" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Guia de Validação e Revisão Humana
          </h2>
          <p className="text-sm text-slate-600">
            A acessibilidade plena não é um checklist puramente técnico: determinados requisitos dependem de sensibilidade, contexto e testes manuais.
          </p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <strong className="block font-semibold mb-0.5">Nota de Integridade Técnica:</strong>
          Ferramentas que prometem "100% de conformidade com a WCAG de forma 100% automática" ignoram as diretrizes oficiais da W3C. A automação é um excelente acelerador diagnóstico, mas a validação humana é indispensável para garantir a dignidade da experiência.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {manualCheckpoints.map(item => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <Icon className="w-4 h-4 text-indigo-600 shrink-0" aria-hidden="true" />
                <span>{item.title}</span>
              </div>
              <div>
                <strong className="text-slate-700">Por que exige revisão humana:</strong>
                <p className="text-slate-600 mt-0.5 leading-relaxed">{item.whyManual}</p>
              </div>
              <div className="pt-1.5 border-t border-slate-200">
                <strong className="text-indigo-900">Como testar:</strong>
                <p className="text-slate-700 mt-0.5 leading-relaxed">{item.howToTest}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
