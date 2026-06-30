"use client";

import { useEffect, useRef, useState } from 'react';
import {
  buildAdviceReply,
  buildFlightReply,
  formatDateLabel,
  buildManualReply,
  buildPartnerReply,
  buildRoomBookingReply,
  buildRoomContactReply,
  buildStayAreaReply,
  buildStayFoundReply,
  buildStayNotFoundReply,
  buildTourReply
} from './chatbot-scenarios';

const TYPING_DELAY_MS = 1000;

function createUserMessage(id, text) {
  return {
    id,
    role: 'user',
    text
  };
}

function createAssistantMessage(id, payload) {
  return {
    id,
    role: 'assistant',
    text: payload.text,
    actions: payload.actions || []
  };
}

export function useRooviaChat({ destinations = [], getRoomCountByCity, onRevealCity }) {
  const [open, setOpen] = useState(false);
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([]);
  const timerRef = useRef(null);
  const sequenceRef = useRef(0);

  useEffect(
    () => () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    },
    []
  );

  function nextId(prefix) {
    sequenceRef.current += 1;
    return `${prefix}-${sequenceRef.current}`;
  }

  function clearPendingReply() {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setTyping(false);
  }

  function queueAssistantReply(userText, assistantPayload, { reset = false } = {}) {
    clearPendingReply();
    setOpen(true);
    const userMessage = createUserMessage(nextId('user'), userText);

    setMessages(previous => (reset ? [userMessage] : [...previous, userMessage]));
    setTyping(true);

    timerRef.current = window.setTimeout(() => {
      setMessages(previous => [...previous, createAssistantMessage(nextId('assistant'), assistantPayload)]);
      setTyping(false);
      timerRef.current = null;
    }, TYPING_DELAY_MS);
  }

  function openAdviceChat() {
    queueAssistantReply('Tôi muốn nhận tư vấn.', buildAdviceReply(), { reset: true });
  }

  function openPartnerChat() {
    queueAssistantReply('Tôi muốn trở thành đối tác Roovia.', buildPartnerReply(), { reset: true });
  }

  function openRoomContactChat(room) {
    const roomName = room?.name ? ` ${room.name}` : '';
    queueAssistantReply(`Tôi muốn liên hệ đặt phòng${roomName}.`, buildRoomContactReply(room), { reset: true });
  }

  function openRoomBookingChat({ room, checkIn, checkOut, guests }) {
    const details = [
      room?.name ? room.name : 'phòng này',
      checkIn && checkOut ? `từ ${formatDateLabel(checkIn)} đến ${formatDateLabel(checkOut)}` : '',
      guests ? `cho ${guests}` : ''
    ].filter(Boolean);

    queueAssistantReply(`Tôi muốn đặt phòng ${details.join(' ')}.`, buildRoomBookingReply({ room, checkIn, checkOut, guests }), { reset: true });
  }

  function sendManualMessage(text) {
    queueAssistantReply(text, buildManualReply());
  }

  function handleQuickAction(action) {
    if (!action) return;

    if (action.kind === 'show-city-rooms') {
      setOpen(false);
      onRevealCity?.(action.city);
      return;
    }

    if (action.kind === 'topic-stay') {
      queueAssistantReply(action.label, buildStayAreaReply(destinations));
      return;
    }

    if (action.kind === 'topic-flight') {
      queueAssistantReply(action.label, buildFlightReply());
      return;
    }

    if (action.kind === 'topic-tour') {
      queueAssistantReply(action.label, buildTourReply());
      return;
    }

    if (action.kind === 'topic-partner') {
      queueAssistantReply(action.label, buildPartnerReply());
      return;
    }

    if (action.kind === 'stay-city') {
      const count = getRoomCountByCity ? getRoomCountByCity(action.city) : 0;
      const reply = count > 0 ? buildStayFoundReply(action.city, count) : buildStayNotFoundReply();
      queueAssistantReply(`Tôi muốn tìm phòng tại ${action.city}.`, reply);
      return;
    }

    if (action.kind === 'stay-no-match') {
      queueAssistantReply(action.label, buildStayNotFoundReply());
    }
  }

  return {
    open,
    typing,
    messages,
    hasConversation: messages.length > 0,
    openAdviceChat,
    openPartnerChat,
    openRoomContactChat,
    openRoomBookingChat,
    sendManualMessage,
    handleQuickAction,
    openChat: () => setOpen(true),
    closeChat: () => setOpen(false)
  };
}
