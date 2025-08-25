import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { MessageSquare, Send, User, Home, Trash2, CheckSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import type { Conversation, Message } from "@shared/schema";

type ConversationWithDetails = Conversation & {
  otherUser: { id: string; username: string; email: string };
  lastMessage?: Message;
  unreadCount: number;
};

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [selectedConversations, setSelectedConversations] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Please log in to view messages</h1>
          <Link href="/" className="text-forum-accent hover:underline">Return to Home</Link>
        </div>
      </div>
    );
  }

  const { data: conversations = [], isLoading } = useQuery<ConversationWithDetails[]>({
    queryKey: ["/api/conversations"],
    meta: {
      headers: { "x-user-id": user.id }
    }
  });

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ["/api/conversations", selectedConversation, "messages"],
    enabled: !!selectedConversation,
    meta: {
      headers: { "x-user-id": user.id }
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedConversation) throw new Error("No conversation selected");
      
      const response = await fetch(`/api/conversations/${selectedConversation}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id
        },
        body: JSON.stringify({ content })
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      return response.json();
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", selectedConversation, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      return await apiRequest(`/api/conversations/${conversationId}/mark-read`, {
        method: "POST",
        headers: { "x-user-id": user.id }
      });
    },
    onSuccess: () => {
      // Refresh conversations and unread count
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/unread-count"] });
    }
  });

  const deleteConversationsMutation = useMutation({
    mutationFn: async (conversationIds: string[]) => {
      return await apiRequest("/api/conversations/delete", {
        method: "POST",
        body: { conversationIds },
        headers: { "x-user-id": user.id }
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Deleted ${selectedConversations.size} conversation(s)`,
      });
      setSelectedConversations(new Set());
      setIsSelectionMode(false);
      setSelectedConversation(null);
      // Refresh conversations and unread count
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/unread-count"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete conversations",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && selectedConversation) {
      sendMessageMutation.mutate(newMessage.trim());
    }
  };

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversation(conversationId);
    // Mark messages as read when conversation is selected
    markAsReadMutation.mutate(conversationId);
  };

  const handleSelectConversation = (conversationId: string, checked: boolean) => {
    const newSelected = new Set(selectedConversations);
    if (checked) {
      newSelected.add(conversationId);
    } else {
      newSelected.delete(conversationId);
    }
    setSelectedConversations(newSelected);
  };

  const handleDeleteSelected = () => {
    if (selectedConversations.size > 0) {
      deleteConversationsMutation.mutate(Array.from(selectedConversations));
    }
  };

  const selectedConversationData = conversations.find(c => c.id === selectedConversation);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <MessageSquare className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
        <Link href="/" className="hover:text-forum-accent transition-colors flex items-center" data-testid="link-home-breadcrumb">
          <Home className="w-4 h-4 mr-1" />
          Home
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white">Messages</span>
      </nav>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">Messages</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <Card className="md:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Conversations
              </CardTitle>
              <div className="flex items-center gap-2">
                {isSelectionMode && selectedConversations.size > 0 && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleDeleteSelected}
                    disabled={deleteConversationsMutation.isPending}
                    data-testid="button-delete-selected"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete ({selectedConversations.size})
                  </Button>
                )}
                <Button
                  size="sm"
                  variant={isSelectionMode ? "secondary" : "outline"}
                  onClick={() => {
                    setIsSelectionMode(!isSelectionMode);
                    setSelectedConversations(new Set());
                  }}
                  data-testid="button-selection-mode"
                >
                  <CheckSquare className="h-4 w-4 mr-1" />
                  {isSelectionMode ? "Cancel" : "Select"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                  <p>No conversations yet</p>
                  <p className="text-sm">Start messaging from a post listing</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      data-testid={`conversation-${conversation.id}`}
                      className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedConversation === conversation.id ? "bg-muted" : ""
                      }`}
                      onClick={() => {
                        if (!isSelectionMode) {
                          handleConversationSelect(conversation.id);
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        {isSelectionMode && (
                          <Checkbox
                            checked={selectedConversations.has(conversation.id)}
                            onCheckedChange={(checked) => handleSelectConversation(conversation.id, !!checked)}
                            onClick={(e) => e.stopPropagation()}
                            data-testid={`checkbox-${conversation.id}`}
                          />
                        )}
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-sm truncate">
                              {conversation.otherUser?.username || 'Unknown User'}
                            </p>
                            {conversation.unreadCount > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                          {conversation.lastMessage && (
                            <p className="text-xs text-muted-foreground truncate mt-1">
                              {(() => {
                                const content = conversation.lastMessage.content;
                                const subjectMatch = content.match(/^Subject:\s*(.+?)(?:\n\n|\n|$)/);
                                return subjectMatch ? subjectMatch[1].trim() : content;
                              })()}
                            </p>
                          )}
                          {conversation.lastMessage?.createdAt && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(new Date(conversation.lastMessage.createdAt), "MMM d, HH:mm")}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Messages Area */}
        <Card className="md:col-span-2">
          {selectedConversation && selectedConversationData ? (
            <>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  {selectedConversationData.otherUser.username}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px] p-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                      <p>No messages yet</p>
                      <p className="text-sm">Start the conversation!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          data-testid={`message-${message.id}`}
                          className={`flex ${message.senderId === user.id ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] p-3 rounded-lg ${
                              message.senderId === user.id
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            {(() => {
                              // Parse subject and content from message
                              const content = message.content;
                              const subjectMatch = content.match(/^Subject:\s*(.+?)(?:\n\n|\n|$)/);
                              
                              if (subjectMatch) {
                                const subject = subjectMatch[1].trim();
                                const messageBody = content.replace(/^Subject:\s*.+?(?:\n\n|\n)/, '').trim();
                                
                                return (
                                  <div>
                                    <div className={`font-semibold text-sm mb-2 pb-2 border-b ${
                                      message.senderId === user.id
                                        ? "border-primary-foreground/20"
                                        : "border-muted-foreground/20"
                                    }`}>
                                      {subject}
                                    </div>
                                    {messageBody && (
                                      <div className="text-sm whitespace-pre-wrap">
                                        {messageBody}
                                      </div>
                                    )}
                                  </div>
                                );
                              } else {
                                return <p className="text-sm whitespace-pre-wrap">{content}</p>;
                              }
                            })()}
                            <p className={`text-xs mt-2 ${
                              message.senderId === user.id
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            }`}>
                              {message.createdAt && format(new Date(message.createdAt), "MMM d, HH:mm")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
                <div className="border-t p-4">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Textarea
                      data-testid="message-input"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="resize-none"
                      rows={2}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                    />
                    <Button 
                      type="submit" 
                      data-testid="send-message-btn"
                      disabled={!newMessage.trim() || sendMessageMutation.isPending}
                      size="sm"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4" />
                <p className="text-lg font-medium">Select a conversation</p>
                <p className="text-sm">Choose a conversation to start messaging</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}