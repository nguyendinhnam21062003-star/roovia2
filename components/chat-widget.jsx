"use client";

import { Drawer } from 'vaul';
import { useEffect, useRef, useState } from 'react';

function ChatMessage({ message, onQuickAction }) {
  const isUser = message.role === 'user';

  return (
    <article className={`chat-message chat-message-${message.role}`}>
      {!isUser ? (
        <span className="chat-message-avatar chat-message-avatar-bot" aria-hidden="true">
          <i data-lucide="messages-square" />
        </span>
      ) : null}

      <div className="chat-message-body">
        <div className={`chat-bubble chat-bubble-${message.role}`}>
          <p>{message.text}</p>
        </div>

        {!isUser && message.actions?.length ? (
          <div className="chat-quick-actions">
            {message.actions.map(action => (
              <button
                key={action.id}
                className={`chat-quick-action${action.tone === 'primary' ? ' primary' : ''}`}
                type="button"
                onClick={() => onQuickAction(action)}
              >
                {action.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}

function TypingState() {
  return (
    <div className="chat-message chat-message-assistant">
      <span className="chat-message-avatar chat-message-avatar-bot" aria-hidden="true">
        <i data-lucide="messages-square" />
      </span>
      <div className="chat-message-body">
        <div className="chat-bubble chat-bubble-assistant chat-bubble-typing" aria-label="Roovia đang nhập">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}

function ChatPanel({ messages, typing, onClose, onQuickAction, onSendMessage }) {
  const [draft, setDraft] = useState('');
  const threadRef = useRef(null);

  useEffect(() => {
    const element = threadRef.current;
    if (!element) return;
    element.scrollTop = element.scrollHeight;
  }, [messages, typing]);

  function submitDraft(event) {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setDraft('');
  }

  return (
    <div className="chat-widget-panel">
      <header className="chat-widget-header">
        <div className="chat-widget-brand">
          <span className="chat-widget-brand-mark" aria-hidden="true">
            <i data-lucide="messages-square" />
          </span>
          <div>
            <strong>Roovia tư vấn</strong>
            <span>Phản hồi tự động trong vài giây</span>
          </div>
        </div>

        <button className="icon-button chat-widget-close" type="button" aria-label="Đóng chat" onClick={onClose}>
          <i data-lucide="x" />
        </button>
      </header>

      <div className="chat-widget-thread" ref={threadRef}>
        {messages.map(message => (
          <ChatMessage key={message.id} message={message} onQuickAction={onQuickAction} />
        ))}
        {typing ? <TypingState /> : null}
      </div>

      <form className="chat-widget-composer" onSubmit={submitDraft}>
        <label className="chat-widget-input">
          <span className="sr-only">Tin nhắn</span>
          <input
            type="text"
            placeholder="Nhập nội dung bạn cần hỗ trợ..."
            value={draft}
            onChange={event => setDraft(event.target.value)}
          />
        </label>
        <button className="button button-primary chat-widget-send" type="submit" disabled={!draft.trim() || typing}>
          Gửi
        </button>
      </form>
    </div>
  );
}

export default function ChatWidget({
  open,
  typing,
  messages,
  hasConversation,
  onOpen,
  onClose,
  onQuickAction,
  onSendMessage
}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const syncViewport = event => setIsMobile(event.matches);

    syncViewport(mediaQuery);
    mediaQuery.addEventListener('change', syncViewport);

    return () => mediaQuery.removeEventListener('change', syncViewport);
  }, []);

  return (
    <>
      {hasConversation && !open ? (
        <button className="chat-launcher" type="button" aria-label="Mở lại đoạn chat" onClick={onOpen}>
          <i data-lucide="messages-square" />
        </button>
      ) : null}

      {!isMobile ? (
        <div className={`chat-widget-desktop${open ? ' open' : ''}`} aria-hidden={!open}>
          <ChatPanel messages={messages} typing={typing} onClose={onClose} onQuickAction={onQuickAction} onSendMessage={onSendMessage} />
        </div>
      ) : (
        <Drawer.Root open={open} onOpenChange={nextOpen => (nextOpen ? onOpen() : onClose())} shouldScaleBackground={false}>
          <Drawer.Portal>
            <Drawer.Overlay className="chat-widget-mobile-overlay" />
            <Drawer.Content className="chat-widget-mobile">
              <div className="chat-widget-mobile-handle" aria-hidden="true" />
              <ChatPanel messages={messages} typing={typing} onClose={onClose} onQuickAction={onQuickAction} onSendMessage={onSendMessage} />
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      )}
    </>
  );
}
