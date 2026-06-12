import { useEffect, useRef, useState } from 'react';
import type { ActiveChat } from '../../types/chat';
import { useAuth } from '../../context/AuthContext';
import { useThemeContext } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { getTheme } from '../../styles/theme';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import type { OnlineUser } from '../../types/socket';
import type { UserProfile } from '../../types/user';
import { useSendingFallback } from '../../hooks/useSendingFallback';
import { useUsers } from '../../hooks/useUsers';
import { useMessages } from '../../hooks/useMessages';
import { useRooms } from '../../hooks/useRooms';
import { useSocketListeners } from '../../hooks/useSocketListeners';
import { getSocket } from '../../services/socket';
import { notify } from '../../utils/toast';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { AppLoader } from '../AppLoader';
import { PinnedMessageBarSkeleton } from './components/ChatSkeletons';
import { PinnedMessageBar } from './components/PinnedMessageBar';
import { SearchResults } from './components/SearchResults';
import { MessageList } from './components/MessageList';
import { TypingIndicator } from './components/TypingIndicator';
import { ReplyPreview } from './components/ReplyPreview';
import { MessageInput } from './components/MessageInput';
import { RoomInfoPanel } from './components/RoomInfoPanel';
import { CreateRoomModal } from './components/CreateRoomModal';
import { UserHoverCard } from './components/UserHoverCard';
import { ProfileModal } from './components/ProfileModal';

type MobileView = 'sidebar' | 'chat' | 'roomInfo';

function getActiveChatKey(c: ActiveChat): string {
  if (c.type === 'global') return 'global';
  if (c.type === 'room') return `room:${c.roomId}`;
  return `private:${c.userId}`;
}

export function Chat() {
  const { accessToken, user } = useAuth();
  const { isDark } = useThemeContext();
  const { t } = useTranslation();
  const theme = getTheme(isDark);
  const breakpoint = useBreakpoint();
  const isMobile = breakpoint === 'mobile';
  const isTablet = breakpoint === 'tablet';

  const [activeChat, setActiveChat] = useState<ActiveChat>({ type: 'global' });
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isSocketDisconnected, setIsSocketDisconnected] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [isRoomInfoOpen, setIsRoomInfoOpen] = useState(false);
  const [mobileView, setMobileView] = useState<MobileView>('chat');
  const [selectedProfileUser, setSelectedProfileUser] =
    useState<UserProfile | null>(null);
  const [hoveredUser, setHoveredUser] = useState<UserProfile | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    isSending,
    setIsSending,
    clearSendingFallback,
    startSendingFallback,
  } = useSendingFallback();
  const { allUsers, setAllUsers, myProfile, setMyProfile } =
    useUsers(accessToken);
  const {
    messages,
    setMessages,
    pinnedMessages,
    setPinnedMessages,
    replyTo,
    setReplyTo,
    highlightedId,
    activePinnedIndex,
    setActivePinnedIndex,
    isMessagesLoading,
    hasMore,
    isLoadingMore,
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    isNavigatingRef,
    loadMore,
    scrollToMessage,
    handleSearch,
    handleSearchClose,
    searchOpen,
    setSearchOpen,
  } = useMessages(accessToken, activeChat);

  const {
    rooms,
    setRooms,
    isRoomsLoading,
    handleSelectRoom,
    handleLeaveRoom,
    handleDeleteRoom,
  } = useRooms(
    accessToken,
    user?.id ?? '',
    isMobile,
    setActiveChat,
    setMobileView,
    setIsRoomInfoOpen,
  );

  useSocketListeners({
    accessToken,
    activeChat,
    userId: user?.id,
    isMobile,
    clearSendingFallback,
    setIsSending,
    setMessages,
    setPinnedMessages,
    setActivePinnedIndex,
    setRooms,
    setActiveChat,
    setIsRoomInfoOpen,
    setMobileView,
    setOnlineUsers,
    setAllUsers,
    setMyProfile,
    setSelectedProfileUser,
    setTypingUsers,
  });

  useEffect(() => {
    if (!accessToken) return;
    const socket = getSocket();
    if (!socket) return;
    const onDisconnect = () => setIsSocketDisconnected(true);
    const onConnect = () => setIsSocketDisconnected(false);
    socket.on('disconnect', onDisconnect);
    socket.on('connect', onConnect);
    return () => {
      socket.off('disconnect', onDisconnect);
      socket.off('connect', onConnect);
    };
  }, [accessToken]);

  useEffect(() => {
    if (activeChat.type !== 'room') return;
    const socket = getSocket();
    if (!socket) return;
    const { roomId } = activeChat;
    const rejoin = () => socket?.emit('room:join', roomId);
    socket.on('connect', rejoin);
    if (socket.connected) rejoin();
    return () => {
      socket.off('connect', rejoin);
    };
  }, [activeChat]);

  if (!accessToken || !user) return null;

  const activeRoom =
    activeChat.type === 'room'
      ? (rooms.find((r) => r._id === activeChat.roomId) ?? null)
      : null;

  function handleSelectGlobal() {
    setActiveChat({ type: 'global' });
    setIsRoomInfoOpen(false);
    if (isMobile) setMobileView('chat');
  }

  function handleOpenRoomInfo() {
    if (isRoomInfoOpen) {
      handleCloseRoomInfo();
    } else {
      setIsRoomInfoOpen(true);
      if (isMobile) setMobileView('roomInfo');
    }
  }

  function handleCloseRoomInfo() {
    setIsRoomInfoOpen(false);
    if (isMobile) setMobileView('chat');
  }

  function sendMessage(text: string) {
    const socket = getSocket();
    if (!socket) {
      notify.error(t('notify.noServerConnection'));
      return;
    }
    if (activeChat.type === 'global')
      socket.emit('send_message', { text, replyTo });
    else if (activeChat.type === 'room')
      socket.emit('room:message:send', {
        roomId: activeChat.roomId,
        text,
        replyTo,
      });
    else if (activeChat.type === 'private')
      socket.emit('private:send', {
        receiverId: activeChat.userId,
        text,
        replyTo,
      });
    setReplyTo(null);
    startSendingFallback();
  }

  function handleEdit(messageId: string, text: string) {
    getSocket()?.emit('message:edit', { messageId, text });
  }

  function handleDeleteForAll(messageId: string) {
    getSocket()?.emit('message:delete', { messageId });
  }

  function handleDeleteForMe(messageId: string) {
    getSocket()?.emit('message:delete:me', { messageId });
    setMessages((prev) => prev.filter((m) => m._id !== messageId));
    setPinnedMessages((prev) => prev.filter((m) => m._id !== messageId));
  }

  function handlePin(messageId: string, isPinned: boolean) {
    const socket = getSocket();
    socket?.emit(isPinned ? 'message:unpin' : 'message:pin', { messageId });
  }

  function getTopBarTitle() {
    if (activeChat.type === 'global') return '# global';
    if (activeChat.type === 'room') return `# ${activeChat.roomName}`;
    return `@ ${activeChat.username}`;
  }

  const showPinnedBar = pinnedMessages.length > 0;

  return (
    <div className={`h-screen flex flex-col ${theme.bgPrimary}`}>
      <TopBar
        title={getTopBarTitle()}
        onlineCount={onlineUsers.length}
        isDark={isDark}
        onOpenMyProfile={() => myProfile && setSelectedProfileUser(myProfile)}
        myProfile={myProfile ?? undefined}
        onSearch={handleSearch}
        onSearchClose={handleSearchClose}
        query={searchQuery}
        onQueryChange={setSearchQuery}
        activeChat={activeChat}
        onOpenRoomInfo={handleOpenRoomInfo}
        isRoomInfoOpen={isRoomInfoOpen}
        isMobile={isMobile}
        mobileView={mobileView}
        onMobileBack={() => {
          if (mobileView === 'roomInfo') {
            setMobileView('chat');
            setIsRoomInfoOpen(false);
          } else setMobileView('sidebar');
        }}
        onOpenSidebar={() => setMobileView('sidebar')}
        searchOpen={searchOpen}
        onSearchOpen={() => setSearchOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden min-h-0">
        {(!isMobile || mobileView === 'sidebar') && (
          <Sidebar
            isDark={isDark}
            onlineUsers={onlineUsers}
            allUsers={allUsers}
            rooms={rooms}
            activeChat={activeChat}
            currentUserId={user.id}
            onSelectGlobal={handleSelectGlobal}
            onSelectRoom={(roomId, roomName) => {
              handleSelectRoom(roomId, roomName);
              setIsRoomInfoOpen(false);
            }}
            onSelectPrivate={(userId, username) => {
              setActiveChat({ type: 'private', userId, username });
              setIsRoomInfoOpen(false);
              if (isMobile) setMobileView('chat');
            }}
            onCreateRoom={() => setShowCreateRoom(true)}
            isRoomsLoading={isRoomsLoading}
            fullWidth={isMobile}
          />
        )}

        {(!isMobile || mobileView === 'chat') && (
          <div
            className={`chat-main-panel relative flex flex-col flex-1 overflow-hidden min-h-0 ${isTablet && isRoomInfoOpen ? 'hidden' : ''}`}
          >
            {isSocketDisconnected && (
              <AppLoader variant="overlay" label={t('app.reconnecting')} />
            )}
            {isMessagesLoading ? (
              <PinnedMessageBarSkeleton isDark={isDark} />
            ) : (
              showPinnedBar && (
                <PinnedMessageBar
                  pinnedMessages={pinnedMessages}
                  isDark={isDark}
                  onScrollToMessage={scrollToMessage}
                  onUnpin={(id) =>
                    getSocket()?.emit('message:unpin', { messageId: id })
                  }
                  currentIndex={activePinnedIndex}
                />
              )
            )}
            {searchQuery.length >= 2 && (
              <SearchResults
                results={searchResults}
                query={searchQuery}
                isSearching={isSearching}
                isDark={isDark}
                onResultClick={scrollToMessage}
                onClose={handleSearchClose}
              />
            )}
            <MessageList
              messages={messages}
              isDark={isDark}
              activeChat={activeChat}
              currentUserId={user.id}
              onReact={(messageId, emoji) =>
                getSocket()?.emit('reaction:toggle', { messageId, emoji })
              }
              onEdit={handleEdit}
              onDeleteForAll={handleDeleteForAll}
              onDeleteForMe={handleDeleteForMe}
              onReply={setReplyTo}
              onPin={handlePin}
              highlightedId={highlightedId}
              onScrollToMessage={scrollToMessage}
              pinnedMessageIds={pinnedMessages.map((m) => m._id)}
              onActivePinChange={setActivePinnedIndex}
              isLoading={isMessagesLoading}
              allUsers={allUsers}
              onUserHover={(u, pos) => {
                if (hoverTimeoutRef.current)
                  clearTimeout(hoverTimeoutRef.current);
                setHoveredUser(u);
                setHoverPosition(pos);
              }}
              onUserLeave={() => {
                hoverTimeoutRef.current = setTimeout(
                  () => setHoveredUser(null),
                  150,
                );
              }}
              onOpenProfile={setSelectedProfileUser}
              hasMore={hasMore}
              isLoadingMore={isLoadingMore}
              onLoadMore={loadMore}
              chatKey={getActiveChatKey(activeChat)}
              isNavigatingRef={isNavigatingRef}
            />
            <TypingIndicator typingUsers={typingUsers} isDark={isDark} />
            {replyTo && (
              <ReplyPreview
                replyTo={replyTo}
                isDark={isDark}
                onCancel={() => setReplyTo(null)}
              />
            )}
            <MessageInput
              key={getActiveChatKey(activeChat)}
              onSend={sendMessage}
              isDark={isDark}
              activeChat={activeChat}
              isSending={isSending}
              isSocketDisconnected={isSocketDisconnected}
            />
          </div>
        )}

        {isRoomInfoOpen &&
          activeRoom &&
          (!isMobile || mobileView === 'roomInfo') && (
            <RoomInfoPanel
              key={activeRoom.description}
              room={activeRoom}
              isDark={isDark}
              allUsers={allUsers}
              currentUserId={user.id}
              onClose={handleCloseRoomInfo}
              onLeave={handleLeaveRoom}
              onJoin={(roomId) => handleSelectRoom(roomId, activeRoom.name)}
              onDelete={handleDeleteRoom}
              onUserHover={(u, pos) => {
                if (hoverTimeoutRef.current)
                  clearTimeout(hoverTimeoutRef.current);
                setHoveredUser(u);
                setHoverPosition(pos);
              }}
              onUserLeave={() => {
                hoverTimeoutRef.current = setTimeout(
                  () => setHoveredUser(null),
                  150,
                );
              }}
              onOpenProfile={setSelectedProfileUser}
              fullWidth={isTablet || isMobile}
            />
          )}
      </div>

      {showCreateRoom && (
        <CreateRoomModal
          isDark={isDark}
          accessToken={accessToken}
          onClose={() => setShowCreateRoom(false)}
          onCreated={(room) => {
            setShowCreateRoom(false);
            handleSelectRoom(room._id, room.name);
          }}
        />
      )}

      {hoveredUser && hoverPosition && !isMobile && (
        <div
          className="fixed z-[999]"
          style={{ left: hoverPosition.x, top: hoverPosition.y }}
          onMouseEnter={() => {
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
          }}
          onMouseLeave={() => setHoveredUser(null)}
        >
          <UserHoverCard
            user={hoveredUser}
            isDark={isDark}
            isOnline={onlineUsers.some((u) => u.userId === hoveredUser._id)}
            onStartChat={(userId, username) => {
              setActiveChat({ type: 'private', userId, username });
              setHoveredUser(null);
            }}
            onClose={() => setHoveredUser(null)}
            currentUserId={user.id}
            onOpenProfile={(u) => {
              setSelectedProfileUser(u);
              setHoveredUser(null);
            }}
          />
        </div>
      )}

      {selectedProfileUser && (
        <ProfileModal
          isDark={isDark}
          profile={selectedProfileUser}
          isOwnProfile={selectedProfileUser._id === user.id}
          isOnline={onlineUsers.some(
            (u) => u.userId === selectedProfileUser._id,
          )}
          onClose={() => setSelectedProfileUser(null)}
          onStartChat={(userId, username) =>
            setActiveChat({ type: 'private', userId, username })
          }
          onProfileUpdate={(updated) => {
            setAllUsers((prev) =>
              prev.map((u) =>
                u._id === updated._id ? { ...u, ...updated } : u,
              ),
            );
            if (myProfile?._id === updated._id) setMyProfile(updated);
            setSelectedProfileUser((prev) =>
              prev?._id === updated._id ? updated : prev,
            );
          }}
        />
      )}
    </div>
  );
}