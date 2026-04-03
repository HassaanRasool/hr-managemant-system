"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Send, 
  MessageSquare, 
  Users, 
  User as UserIcon, 
  Megaphone,
  Search,
  Hash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Input } from "@/components/ui/input";
import { Team, ChatMessage, User } from "@/types/db";
import { useAuth } from "@/lib/auth-store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Extend ChatMessage with the joined fields we return from API
interface UIMessage extends ChatMessage {
  sender_name?: string;
  sender_email?: string;
  target_team_name?: string;
  target_user_name?: string;
}

export function ChatManagement() {
  const { user: currentUser } = useAuth();
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("staff");
  
  // Sidebar/Channel State
  const [selectedChannel, setSelectedChannel] = useState<{
    type: 'all' | 'team' | 'individual';
    id: string | null;
    name: string;
  }>({ type: 'all', id: null, name: 'Announcements' });

  // New Message State
  const [content, setContent] = useState("");
  
  // Options for specific targets
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUserRole = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", {
        headers: { "authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUserRole(data.role);
        if (data.role === "admin" || data.role === "hr_manager") {
          fetchTeams();
          fetchUsers();
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch("/api/chat", {
        headers: { "authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        setMessages(await res.json());
      }
    } catch {
      toast.error("Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserRole();
    fetchMessages();
  }, [fetchUserRole, fetchMessages]);

  const fetchTeams = async () => {
    try {
      const res = await fetch("/api/teams");
      if (res.ok) setTeams(await res.json());
    } catch {}
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users", {
         headers: { "authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) setUsers(await res.json());
    } catch {}
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    // Use selected channel as target
    const targetType = selectedChannel.type;
    const targetId = selectedChannel.id;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ content, target_type: targetType, target_id: targetId }),
      });
      if (res.ok) {
        toast.success("Message sent");
        setContent("");
        fetchMessages();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to send message");
      }
    } catch {
      toast.error("An error occurred");
    }
  };

  const filteredMessages = messages.filter(msg => {
    if (selectedChannel.type === 'all') return msg.target_type === 'all';
    if (selectedChannel.type === 'team') return msg.target_type === 'team' && msg.target_id === selectedChannel.id;
    if (selectedChannel.type === 'individual') {
      return msg.target_type === 'individual' && (msg.target_id === selectedChannel.id || msg.sender_id === selectedChannel.id);
    }
    return false;
  }).reverse(); // Latest at bottom

  const isAdminOrHR = userRole === "admin" || userRole === "hr_manager";

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] min-h-[600px] border rounded-xl overflow-hidden bg-background shadow-lg">
      <div className="grid grid-cols-12 h-full divide-x">
        
        {/* Sidebar */}
        <div className="col-span-12 md:col-span-4 lg:col-span-3 flex flex-col bg-muted/20">
          <div className="p-4 border-b bg-muted/40">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Channels
            </h2>
            <div className="relative mt-3">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-9 h-9 bg-background"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="p-2 space-y-4">
              {/* Broadcasts Section */}
              <div>
                <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Announcements</p>
                <Button
                  variant={selectedChannel.type === 'all' ? "secondary" : "ghost"}
                  className="w-full justify-start gap-2 h-11"
                  onClick={() => setSelectedChannel({ type: 'all', id: null, name: 'Global Announcements' })}
                >
                  <Megaphone className="w-4 h-4 text-orange-500" />
                  <span className="font-medium">Public Broadcasts</span>
                </Button>
              </div>

              {/* Teams Section */}
              <div>
                <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">My Teams</p>
                <div className="space-y-1">
                  {teams.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase())).map(team => (
                    <Button
                      key={team.id}
                      variant={selectedChannel.type === 'team' && selectedChannel.id === team.id ? "secondary" : "ghost"}
                      className="w-full justify-start gap-2 h-10 font-normal"
                      onClick={() => setSelectedChannel({ type: 'team', id: team.id, name: team.name })}
                    >
                      <Hash className="w-4 h-4 text-primary/60" />
                      {team.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* DMs Section (Admin/HR only can see all, staff see nothing or search) */}
              {isAdminOrHR && (
                <div>
                  <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Direct Messages</p>
                  <div className="space-y-1">
                    {users.filter(u => u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()))
                      .slice(0, 10).map(u => (
                      <Button
                        key={u.id}
                        variant={selectedChannel.type === 'individual' && selectedChannel.id === u.id ? "secondary" : "ghost"}
                        className="w-full justify-start gap-2 h-10 font-normal"
                        onClick={() => setSelectedChannel({ type: 'individual', id: u.id, name: u.name || u.email })}
                      >
                        <UserIcon className="w-4 h-4 text-muted-foreground" />
                        <span className="truncate">{u.name || u.email}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Message Feed Area */}
        <div className="col-span-12 md:col-span-8 lg:col-span-9 flex flex-col h-full bg-background relative">
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between bg-background/95 backdrop-blur sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                {selectedChannel.type === 'all' && <Megaphone className="w-5 h-5 text-primary" />}
                {selectedChannel.type === 'team' && <Users className="w-5 h-5 text-primary" />}
                {selectedChannel.type === 'individual' && <UserIcon className="w-5 h-5 text-primary" />}
              </div>
              <div>
                <h3 className="font-bold leading-none">{selectedChannel.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedChannel.type === 'all' && 'Broadcast to every employee'}
                  {selectedChannel.type === 'team' && `Official team communication for ${selectedChannel.name}`}
                  {selectedChannel.type === 'individual' && `Private conversation with ${selectedChannel.name}`}
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-6 overflow-y-auto">
            {filteredMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-12 text-center opacity-50">
                <MessageSquare className="w-16 h-16 mb-4" />
                <p className="text-lg font-medium italic">Start the conversation in {selectedChannel.name}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredMessages.map((msg, idx) => {
                  const isOwn = msg.sender_id === currentUser?.id;
                  const showSender = idx === 0 || filteredMessages[idx-1].sender_id !== msg.sender_id;
                  
                  return (
                    <div key={msg.id} className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                      {showSender && !isOwn && (
                        <span className="text-xs font-semibold mb-1 ml-1 text-muted-foreground">
                          {msg.sender_name || msg.sender_email}
                        </span>
                      )}
                      
                      <div className={`flex gap-2 max-w-[85%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                        <Avatar className="w-8 h-8 mt-auto shrink-0 ring-1 ring-border">
                          <AvatarFallback className={isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'}>
                            {(msg.sender_name || msg.sender_email || "U").charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className={`group relative p-3 rounded-2xl shadow-sm ${
                          isOwn 
                            ? 'bg-primary text-primary-foreground rounded-br-none' 
                            : 'bg-muted rounded-bl-none'
                        }`}>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                          <span className={`text-[10px] mt-1 block opacity-60 ${isOwn ? 'text-right' : 'text-left'}`}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Input Area */}
          {(isAdminOrHR || selectedChannel.type !== 'all') && (
            <div className="p-4 border-t bg-muted/10">
              <form onSubmit={handleSendMessage} className="flex gap-2 items-center bg-background p-2 rounded-xl border-2 border-primary/20 focus-within:border-primary transition-all">
                <Textarea
                  placeholder={`Message ${selectedChannel.name}...`}
                  className="flex-1 min-h-[44px] h-11 border-0 focus-visible:ring-0 resize-none py-2.5 px-3 bg-transparent"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={!content.trim()}
                  className="rounded-lg shrink-0 h-10 w-10 shadow-md"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
              <p className="text-[10px] text-muted-foreground mt-2 px-1">
                Press Enter to send, Shift+Enter for new line.
              </p>
            </div>
          )}
          
          {selectedChannel.type === 'all' && !isAdminOrHR && (
            <div className="p-4 border-t bg-muted/30 text-center">
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-2 italic">
                <Megaphone className="w-3 h-3" />
                Only Admins and HR Managers can broadcast to this channel.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
