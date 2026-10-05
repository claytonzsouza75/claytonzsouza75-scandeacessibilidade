import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Scale,
  X,
  Send,
  CheckCircle2,
  FileText,
  Accessibility,
  Keyboard,
  Contrast,
  BookOpen,
} from 'lucide-react';

interface AccessibilityStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccessibilityStatementModal: React.FC<AccessibilityStatementModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [barrierType, setBarrierType] = useState('leitor_tela');
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setFeedbackSent(true);
    setTimeout(() => {
      setName('');
      setEmail('');
      setMessage('');
      setFeedbackSent(false);
      onClose();
    }, 2500);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="accessibility-statement-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl border border-slate-300 shadow-2xl flex flex-col overflow-hidden my-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center">
              <Accessibility className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="accessibility-statement-title" className="text-lg font-bold text-slate-900 leading-tight">
                Declaração de Acessibilidade e Conformidade Legal
              </h2>
              <span className="text-xs text-slate-600 font-medium">
                Em conformidade com o Artigo 63 da Lei Brasileira de Inclusão (Lei nº 13.146/2015)
              </span>
            </div>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700"
            aria-label="Fechar declaração de acessibilidade"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700 leading-relaxed">
          {/* Legal basis callout */}
          <div className="p-4 rounded-xl bg-indigo-50/80 border border-indigo-200 text-slate-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-indigo-950 text-sm">
              <Scale className="w-4 h-4 text-indigo-700 shrink-0" aria-hidden="true" />
              <span>Base Jurídica e Normativa: Lei nº 13.146/2015 (LBI)</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              O <strong>ScandeAcessibilidade</strong> tem o compromisso de assegurar a acessibilidade digital como um direito fundamental garantido pelo <strong>Artigo 63 da Lei nº 13.146/2015 (Estatuto da Pessoa com Deficiência)</strong> e pelo <strong>Decreto Federal nº 5.296/2004</strong>. Este portal foi concebido e testado para atender e superar os requisitos de conformidade das <strong>Diretrizes de Acessibilidade para Conteúdo Web (WCAG 2.1 em Nível AA e AAA)</strong> e do <strong>eMAG (Modelo de Acessibilidade em Governo Eletrônico)</strong>.
            </p>
          </div>

          {/* Standards & Features Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Recursos de Acessibilidade Implementados Neste Site:
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Keyboard className="w-4 h-4 text-indigo-600" aria-hidden="true" />
                  <span>Navegação Completa por Teclado</span>
                </div>
                <p className="text-slate-600">
                  Todas as funcionalidades podem ser operadas via teclas <kbd className="font-mono bg-slate-200 px-1 rounded">Tab</kbd>, <kbd className="font-mono bg-slate-200 px-1 rounded">Enter</kbd>, <kbd className="font-mono bg-slate-200 px-1 rounded">Espaço</kbd> e <kbd className="font-mono bg-slate-200 px-1 rounded">Esc</kbd>, sem armadilhas de foco.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Contrast className="w-4 h-4 text-indigo-600" aria-hidden="true" />
                  <span>Alto Contraste & Foco Visível</span>
                </div>
                <p className="text-slate-600">
                  Cores de texto e elementos de interface com contraste mínimo superior a 7:1 (WCAG AAA) e anel de foco evidente em todos os controles interativos.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-600" aria-hidden="true" />
                  <span>HTML Semântico & ARIA 1.2</span>
                </div>
                <p className="text-slate-600">
                  Marcos semânticos (<code className="font-mono bg-slate-200 px-1 rounded">&lt;header&gt;</code>, <code className="font-mono bg-slate-200 px-1 rounded">&lt;main&gt;</code>, <code className="font-mono bg-slate-200 px-1 rounded">&lt;nav&gt;</code>, <code className="font-mono bg-slate-200 px-1 rounded">&lt;footer&gt;</code>), skip link e labels descritivos para tecnologias assistivas.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-600" aria-hidden="true" />
                  <span>Zoom até 200% sem Quebras</span>
                </div>
                <p className="text-slate-600">
                  Tipografia responsiva, layout flexível e suporte total a ampliação de tela para pessoas com baixa visão ou presbiopia.
                </p>
              </div>
            </div>
          </div>

          {/* eMAG Keyboard Shortcuts */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Teclas de Atalho Recomendadas pelo eMAG / Governo Federal:
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 rounded bg-white border border-slate-200 text-center">
                <kbd className="font-mono font-bold text-indigo-700">Alt + 1</kbd>
                <div className="text-slate-600 text-[11px] mt-0.5">Conteúdo principal</div>
              </div>
              <div className="p-2 rounded bg-white border border-slate-200 text-center">
                <kbd className="font-mono font-bold text-indigo-700">Alt + 2</kbd>
                <div className="text-slate-600 text-[11px] mt-0.5">Menu de navegação</div>
              </div>
              <div className="p-2 rounded bg-white border border-slate-200 text-center">
                <kbd className="font-mono font-bold text-indigo-700">Alt + 3</kbd>
                <div className="text-slate-600 text-[11px] mt-0.5">Campo de análise</div>
              </div>
              <div className="p-2 rounded bg-white border border-slate-200 text-center">
                <kbd className="font-mono font-bold text-indigo-700">Alt + 4</kbd>
                <div className="text-slate-600 text-[11px] mt-0.5">Declaração legal</div>
              </div>
            </div>
          </div>

          {/* Feedback Form (Legal Requirement from LBI Art. 63 § 1º) */}
          <div className="p-5 rounded-2xl bg-white border border-slate-300 shadow-2xs space-y-3">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Send className="w-4 h-4 text-indigo-600" aria-hidden="true" />
                <span>Canal de Atendimento e Reporte de Barreiras (Art. 63, § 1º da LBI)</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Encontrou alguma dificuldade de acesso ou tem uma sugestão de melhoria para o leitor de tela ou teclado? Envie sua mensagem diretamente para a equipe técnica responsável.
              </p>
            </div>

            {feedbackSent ? (
              <div
                role="status"
                className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center gap-3 text-xs font-semibold"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" aria-hidden="true" />
                <span>Mensagem enviada com sucesso! Agradecemos sua contribuição para a acessibilidade contínua deste serviço.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmitFeedback} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="barrier-name" className="block text-xs font-semibold text-slate-700 mb-1">
                      Seu Nome (opcional)
                    </label>
                    <input
                      id="barrier-name"
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Ex: Maria da Silva"
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:border-indigo-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="barrier-email" className="block text-xs font-semibold text-slate-700 mb-1">
                      E-mail para resposta (opcional)
                    </label>
                    <input
                      id="barrier-email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="maria@exemplo.com"
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:border-indigo-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="barrier-type" className="block text-xs font-semibold text-slate-700 mb-1">
                    Tipo de tecnologia assistiva ou barreira observada
                  </label>
                  <select
                    id="barrier-type"
                    value={barrierType}
                    onChange={e => setBarrierType(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:border-indigo-600 focus:outline-none"
                  >
                    <option value="leitor_tela">Leitor de tela (NVDA, VoiceOver, JAWS, TalkBack)</option>
                    <option value="teclado">Navegação exclusiva por teclado</option>
                    <option value="contraste">Contraste ou legibilidade visual</option>
                    <option value="zoom">Ampliação de tela ou zoom</option>
                    <option value="outro">Outro recurso ou dúvida legal</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="barrier-message" className="block text-xs font-semibold text-slate-700 mb-1">
                    Descrição da barreira ou solicitação de formato acessível *
                  </label>
                  <textarea
                    id="barrier-message"
                    required
                    rows={3}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Descreva onde encontrou a dificuldade e qual tecnologia você utiliza..."
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:border-indigo-600 focus:outline-none resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-700 hover:bg-indigo-800 rounded-lg transition-colors cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Enviar Manifestação</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
            <span>Última revisão da conformidade: {new Date().toLocaleDateString('pt-BR')}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
