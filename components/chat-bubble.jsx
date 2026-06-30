"use client";

import { Drawer } from 'vaul';
import { useEffect, useRef, useState } from 'react';
import { buildChatConversation } from '../lib/chat';

function UserMessage({ message }) {
  return (
    <article className="chat-message chat-message-user">
      <div className="chat-message-meta">
        <span>Bạn</span>
        <span>{message.timeLabel}</span>
      </div>
      <div className="chat-bubble chat-bubble-user">
        <p>{message.text}</p>
      </div>
    </article>
  );
}

function AssistantMessage({ message }) {
  return (
    <article className="chat-message chat-message-assistant">
      <span className="chat-avatar chat-avatar-bot" aria-hidden="true">
        <i data-lucide="message-circle" />
      </span>
      <div className="chat-message-body">
        <div className="chat-message-meta">
          <strong>Admin StayBridge</strong>
          <span>{message.timeLabel}</span>
        </div>

        <div className="chat-reply-card">
          <p className="chat-reply-intro">
            Xin chào quý khách, chúng tôi đã nhận được <strong>{message.requestLabel}</strong>
            {message.subject ? (
              <>
                {' '}
                cho <mark>{message.subject}</mark>
              </>
            ) : null}
            {' '}
            của quý khách.
          </p>

          <ul className="chat-highlight-list" aria-label="Thông tin chính">
            {message.highlights.map(item => (
              <li className="chat-highlight-item" key={item.label}>
                <span className="chat-highlight-bullet" aria-hidden="true" />
                <div className="chat-highlight-content">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              </li>
            ))}
          </ul>

          <p className="chat-reply-note">
            <strong>Quý khách vui lòng:</strong> {message.note}
          </p>

          <div className="chat-reply-emergency">
            <span className="chat-reply-emergency-label">Hỗ trợ gấp</span>
            <p>{message.emergency}</p>
          </div>

          <div className="chat-reply-actions" aria-label="Kênh liên hệ">
            {message.contacts.map(contact =>
              contact.kind === 'link' ? (
                <a className={`chat-action-link${contact.tone ? ` ${contact.tone}` : ''}`} href={contact.href} key={contact.label}>
                  <i data-lucide={contact.icon} />
                  {contact.label}
                </a>
              ) : (
                <span className={`chat-action-tag${contact.tone ? ` ${contact.tone}` : ''}`} key={contact.label}>
                  <i data-lucide={contact.icon} />
                  {contact.label}
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function ChatBubble({
  open,
  mode = 'consultation',
  roomName = '',
  checkIn = '',
  checkOut = '',
  guests = '',
  onOpen,
  onClose
}) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const inputRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    document.body.classList.toggle('drawer-open', open);
    return () => {
      document.body.classList.remove('drawer-open');
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setMessages(buildChatConversation({ mode, roomName, checkIn, checkOut, guests }));
    setDraft('');
  }, [open, mode, roomName, checkIn, checkOut, guests]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, open]);

  function submitMessage(event) {
    event.preventDefault();
    const value = draft.trim();
    if (!value) return;
    setMessages(prev => [...prev, { id: `user-${Date.now()}`, role: 'user', text: value, timeLabel: 'Vừa xong' }]);
    setDraft('');
  }

  function handleOpenChange(nextOpen) {
    if (nextOpen) {
      onOpen?.();
      return;
    }

    onClose?.();
  }

  return (
    <>
      <button
        className={`chat-launcher${open ? ' is-hidden' : ''}`}
        type="button"
        aria-label="Mở chat"
        aria-hidden={open}
        tabIndex={open ? -1 : 0}
        onClick={() => onOpen?.()}
      >
        <span className="chat-launcher-icon" aria-hidden="true">
          <i data-lucide="message-circle" />
        </span>
      </button>

      <Drawer.Root
        open={open}
        direction="bottom"
        onOpenChange={handleOpenChange}
        shouldScaleBackground={false}
        noBodyStyles
      >
        <Drawer.Portal>
          <Drawer.Overlay className="chat-widget-overlay" />
          <Drawer.Content className="chat-widget chat-widget--bottom">
            <div className="chat-widget-shell">
              <Drawer.Handle className="chat-widget-handle" />

              <header className="chat-widget-header">
                <div className="chat-widget-brand">
                  <span className="chat-widget-avatar" aria-hidden="true">
                    <i data-lucide="message-circle" />
                  </span>
                  <div className="chat-widget-title">
                    <Drawer.Title asChild>
                      <strong id="chatWidgetTitle">Admin StayBridge</strong>
                    </Drawer.Title>
                    <Drawer.Description className="sr-only">
                      Khung chat hỗ trợ tư vấn và đặt phòng của StayBridge.
                    </Drawer.Description>
                    <span className="chat-widget-status">
                      <span className="chat-status-dot" aria-hidden="true" />
                      Đang trực tuyến
                    </span>
                  </div>
                </div>

                <div className="chat-widget-actions">
                  <Drawer.Close asChild>
                    <button className="icon-button chat-widget-close" type="button" aria-label="Đóng chat">
                      <i data-lucide="x" />
                    </button>
                  </Drawer.Close>
                </div>
              </header>

              <div className="chat-widget-thread" aria-live="polite">
                {messages.map(message =>
                  message.role === 'assistant' ? <AssistantMessage key={message.id} message={message} /> : <UserMessage key={message.id} message={message} />
                )}
                <div ref={endRef} />
              </div>

              <form className="chat-widget-composer" onSubmit={submitMessage}>
                <div className="chat-widget-input">
                  <span id="chatWidgetInputLabel">Để lại số điện thoại hoặc Zalo</span>
                  <div className="chat-widget-input-shell">
                    <input
                      ref={inputRef}
                      type="text"
                      aria-labelledby="chatWidgetInputLabel"
                      value={draft}
                      onChange={event => setDraft(event.target.value)}
                      placeholder="Nhập số điện thoại hoặc Zalo cá nhân"
                      autoComplete="off"
                    />
                    <button className="button button-primary chat-widget-send" type="submit" disabled={!draft.trim()}>
                      <i data-lucide="send" />
                      Gửi
                    </button>
                  </div>
                </div>

                <p className="chat-widget-helper">Nhân viên kinh doanh sẽ liên hệ lại sau khi nhận được thông tin.</p>
              </form>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}
