import { useState } from 'react'
import ConversationList from '../components/messages/ConversationList'
import ChatWindow from '../components/messages/ChatWindow'

export default function Messages() {
  const [selectedUser, setSelectedUser] = useState(null)

  return (
    <div className="flex flex-col md:flex-row bg-card rounded-2xl border border-border overflow-hidden" style={{ height: 'calc(100vh - 112px)' }}>
      <div className={`${selectedUser ? 'hidden md:flex' : 'flex'} flex-col`}>
        <ConversationList onSelect={setSelectedUser} selectedId={selectedUser?.id} />
      </div>
      <div className={`${selectedUser ? 'flex' : 'hidden md:flex'} flex-1 min-w-0`}>
        <ChatWindow otherUser={selectedUser} onBack={() => setSelectedUser(null)} />
      </div>
    </div>
  )
}
