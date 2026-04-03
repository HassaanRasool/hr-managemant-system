"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Users, 
  UserPlus, 
  Trash2, 
  Search, 
  Filter, 
  Shield, 
  UserCircle,
  MoreVertical,
  Settings2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Team } from "@/types/db";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { useCallback } from "react";
import { User } from "@/types/db";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TeamMemberDisplay {
  membership_id: string;
  team_id: string;
  team_role: string;
  created_at: string;
  user_id: string;
  name: string | null;
  email: string;
  user_role: string;
}

export function TeamsManagement() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMemberDisplay[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userRole, setUserRole] = useState("staff");

  // New team form state
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDesc, setNewTeamDesc] = useState("");

  // New member form state
  const [selectedUserId, setSelectedUserId] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("Member");

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/users", {
        headers: { "authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        setUsers(await res.json());
      }
    } catch {}
  }, []);

  const fetchUserRole = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", {
        headers: { "authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUserRole(data.role);
        if (data.role === "admin" || data.role === "hr_manager") {
          fetchUsers();
        }
      }
    } catch {}
  }, [fetchUsers]);

  const fetchTeams = useCallback(async () => {
    try {
      const res = await fetch("/api/teams");
      if (res.ok) {
        setTeams(await res.json());
      }
    } catch {
      toast.error("Failed to fetch teams");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMembers = useCallback(async (teamId: string) => {
    try {
      const res = await fetch(`/api/teams/${teamId}/members`);
      if (res.ok) {
        setMembers(await res.json());
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchUserRole();
    fetchTeams();
  }, [fetchUserRole, fetchTeams]);

  useEffect(() => {
    if (selectedTeam) {
      fetchMembers(selectedTeam.id);
      setSearchTerm("");
      setRoleFilter("All");
    }
  }, [selectedTeam, fetchMembers]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ name: newTeamName, description: newTeamDesc }),
      });
      if (res.ok) {
        toast.success("Team created");
        fetchTeams();
        setIsDialogOpen(false);
        setNewTeamName("");
        setNewTeamDesc("");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to create team");
      }
    } catch {
      toast.error("An error occurred");
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam) return;
    try {
      const res = await fetch(`/api/teams/${selectedTeam.id}/members`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ user_id: selectedUserId, role: newMemberRole }),
      });
      if (res.ok) {
        toast.success("Member added");
        fetchMembers(selectedTeam.id);
        setSelectedUserId("");
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to add member");
      }
    } catch {
      toast.error("An error occurred");
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    if (!selectedTeam) return;
    try {
      const res = await fetch(`/api/teams/${selectedTeam.id}/members`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ user_id: userId, role: newRole }),
      });
      if (res.ok) {
        toast.success("Role updated");
        fetchMembers(selectedTeam.id);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to update role");
      }
    } catch {
      toast.error("An error occurred");
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!selectedTeam) return;
    try {
      const res = await fetch(`/api/teams/${selectedTeam.id}/members?user_id=${userId}`, {
        method: "DELETE",
        headers: { "authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) {
        toast.success("Member removed");
        fetchMembers(selectedTeam.id);
      } else {
        toast.error("Failed to remove member");
      }
    } catch {
      toast.error("An error occurred");
    }
  };

  const isAdminOrHR = userRole === "admin" || userRole === "hr_manager";

  const filteredMembers = members.filter(member => {
    const matchesSearch = (member.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (member.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "All" || member.team_role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "Manager":
       return (
         <Badge className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 px-2.5 py-1">
           <Shield className="w-3 h-3" />
           Manager
         </Badge>
       );
      case "Lead":
       return (
         <Badge className="bg-sky-500 hover:bg-sky-600 text-white flex items-center gap-1.5 px-2.5 py-1">
           <Settings2 className="w-3 h-3" />
           Lead
         </Badge>
       );
      default:
       return (
         <Badge variant="outline" className="bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center gap-1.5 px-2.5 py-1 border-slate-200">
           <UserCircle className="w-3 h-3" />
           Member
         </Badge>
       );
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teams Management</h1>
          <p className="text-muted-foreground mt-2">Manage organizational teams and their members systematically.</p>
        </div>
        {isAdminOrHR && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Create Team</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Team</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateTeam} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Team Name</Label>
                  <Input id="name" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desc">Description</Label>
                  <Input id="desc" value={newTeamDesc} onChange={(e) => setNewTeamDesc(e.target.value)} />
                </div>
                <Button type="submit" className="w-full">Create Team</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-4 space-y-3">
          {teams.map((team) => (
            <Card 
              key={team.id} 
              className={`cursor-pointer transition-all duration-300 group ${selectedTeam?.id === team.id 
                ? 'border-primary ring-1 ring-primary/20 bg-linear-to-r from-primary/10 to-transparent shadow-md' 
                : 'hover:border-primary/40 hover:bg-muted/30'}`}
              onClick={() => setSelectedTeam(team)}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`p-3 rounded-xl transition-colors ${selectedTeam?.id === team.id ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-muted group-hover:bg-primary/10 group-hover:text-primary text-muted-foreground'}`}>
                  <Users className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base truncate">{team.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{team.description || "Active Organizational Team"}</p>
                </div>
                {selectedTeam?.id === team.id && (
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="md:col-span-8">
          {selectedTeam ? (
            <Card className="shadow-sm border-border/50">
              <CardHeader className="bg-muted/30 border-b pb-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <CardTitle className="text-2xl">{selectedTeam.name}</CardTitle>
                    <CardDescription className="mt-1">Manage all personnel within this team</CardDescription>
                  </div>
                  <Badge variant="outline" className="px-3 py-1">
                    {members.length} {members.length === 1 ? 'Member' : 'Members'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6 pt-6">
                {isAdminOrHR && (
                  <form onSubmit={handleAddMember} className="flex gap-3 items-end p-4 bg-muted/50 rounded-lg border border-border/50">
                    <div className="space-y-2 flex-1">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Add User</Label>
                      <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Search users by name or email..." />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((u) => (
                            <SelectItem key={u.id} value={u.id}>
                              {u.name || u.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</Label>
                      <Select value={newMemberRole} onValueChange={setNewMemberRole}>
                        <SelectTrigger className="w-[140px] bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Member">Member</SelectItem>
                          <SelectItem value="Lead">Lead</SelectItem>
                          <SelectItem value="Manager">Manager</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" disabled={!selectedUserId} className="shrink-0">
                      <UserPlus className="mr-2 h-4 w-4" /> Add
                    </Button>
                  </form>
                )}

                {members.length > 0 && (
                  <div className="flex gap-4 items-center mb-4 flex-wrap">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Filter by name or email..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger className="w-[160px]">
                        <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Roles</SelectItem>
                        <SelectItem value="Manager">Managers</SelectItem>
                        <SelectItem value="Lead">Leads</SelectItem>
                        <SelectItem value="Member">Members</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
                  {members.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                      <Users className="h-10 w-10 mb-3 opacity-20" />
                      <p>This team has no assigned members yet.</p>
                      {isAdminOrHR && <p className="text-sm mt-1">Use the form above to add an employee.</p>}
                    </div>
                  ) : filteredMembers.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">
                      <p>No members matched your search criteria.</p>
                      <Button variant="link" onClick={() => {setSearchTerm(""); setRoleFilter("All")}}>Clear filters</Button>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/40">
                      {filteredMembers.map(member => (
                        <div key={member.membership_id} className="flex items-center justify-between p-4 flex-wrap gap-4 transition-all hover:bg-muted/40">
                          <div className="flex items-center gap-4">
                             <Avatar className="h-11 w-11 ring-2 ring-primary/10">
                               <AvatarFallback className="bg-linear-to-br from-primary/20 to-primary/5 text-primary font-bold">
                                 {(member.name || member.email).charAt(0).toUpperCase()}
                               </AvatarFallback>
                             </Avatar>
                             <div>
                               <div className="flex items-center gap-2">
                                 <p className="font-bold text-sm tracking-tight">{member.name || member.email}</p>
                                 <span className="md:hidden">{getRoleBadge(member.team_role)}</span>
                               </div>
                               <p className="text-xs text-muted-foreground font-medium opacity-80">{member.email}</p>
                             </div>
                          </div>
                          
                          <div className="flex items-center gap-4 shrink-0">
                             <div className="hidden md:block">
                               {getRoleBadge(member.team_role)}
                             </div>
                             
                             {isAdminOrHR && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-muted font-bold">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-[180px]">
                                    <div className="px-2 py-1.5 text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                                      Change Role
                                    </div>
                                    <DropdownMenuItem onClick={() => handleUpdateRole(member.user_id, "Manager")} className="gap-2">
                                      <Shield className="w-4 h-4 text-indigo-600" />
                                      Manager
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleUpdateRole(member.user_id, "Lead")} className="gap-2">
                                      <Settings2 className="w-4 h-4 text-sky-500" />
                                      Lead
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleUpdateRole(member.user_id, "Member")} className="gap-2">
                                      <UserCircle className="w-4 h-4 text-slate-500" />
                                      Member
                                    </DropdownMenuItem>
                                    <div className="h-px bg-muted my-1" />
                                    <DropdownMenuItem 
                                      className="text-destructive focus:bg-destructive/10 focus:text-destructive gap-2 font-semibold"
                                      onClick={() => handleRemoveMember(member.user_id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      Remove from Team
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                             )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center min-h-[500px] border-dashed">
              <div className="text-center text-muted-foreground max-w-sm">
                <div className="bg-muted p-4 rounded-full inline-block mb-4">
                   <Users className="h-8 w-8 opacity-40" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No Team Selected</h3>
                <p>Select a team from the left sidebar to view its personnel, manage members, and configure roles.</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
