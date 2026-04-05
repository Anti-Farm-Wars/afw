import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, LogOut, Trash2, UserPlus, Search, Plus, Upload, Tag, User, BookOpen, Clock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function StaffDashboard() {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [associations, setAssociations] = useState<any[]>([]);
  const [playerAssociations, setPlayerAssociations] = useState<any[]>([]);
  const [associationTypes, setAssociationTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [clanTag, setClanTag] = useState("");
  const [clanData, setClanData] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);
  const [associationType, setAssociationType] = useState("");
  const [description, setDescription] = useState("");
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffPassword, setNewStaffPassword] = useState("");
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeDesc, setNewTypeDesc] = useState("");
  const [newTypeColor, setNewTypeColor] = useState("#3b82f6");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [playerTag, setPlayerTag] = useState("");
  const [playerData, setPlayerData] = useState<any>(null);
  const [verifyingPlayer, setVerifyingPlayer] = useState(false);
  const [playerAssociationType, setPlayerAssociationType] = useState("");
  const [playerDescription, setPlayerDescription] = useState("");
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [selectedUserRole, setSelectedUserRole] = useState<string>("");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/staff");
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/staff");
      return;
    }
    setUser(session.user);
    
    // Check user role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .single();
    
    const role = roleData?.role || null;
    setUserRole(role);
    
    // view_sync users should only access /sync
    if (role === 'view_sync') {
      navigate("/sync");
      return;
    }
    
    loadAssociations();
    loadPlayerAssociations();
    loadAssociationTypes();
    if (role === 'admin' || role === 'primary_admin') {
      loadAllUsers();
    }
    setLoading(false);
  };

  const loadAllUsers = async () => {
    try {
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Get all user roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      // Merge profiles with roles
      const usersWithRoles = profiles?.map(profile => {
        const userRoles = roles?.filter(r => r.user_id === profile.id) || [];
        return {
          ...profile,
          roles: userRoles.map(r => r.role),
          roleIds: userRoles.map(r => r.id)
        };
      }) || [];

      setAllUsers(usersWithRoles);
    } catch (error: any) {
      console.error("Error loading users:", error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/staff");
  };

  const loadAssociations = async () => {
    const { data, error } = await supabase
      .from("clan_associations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load associations",
        variant: "destructive",
      });
    } else {
      setAssociations(data || []);
    }
  };

  const loadAssociationTypes = async () => {
    const { data, error } = await supabase
      .from("association_types")
      .select("*")
      .order("name");

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load association types",
        variant: "destructive",
      });
    } else {
      setAssociationTypes(data || []);
    }
  };

  const loadPlayerAssociations = async () => {
    const { data, error } = await supabase
      .from("player_associations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load player associations",
        variant: "destructive",
      });
    } else {
      setPlayerAssociations(data || []);
    }
  };

  const verifyClan = async () => {
    if (!clanTag.trim()) {
      toast({
        title: "Error",
        description: "Please enter a clan tag",
        variant: "destructive",
      });
      return;
    }

    setVerifying(true);
    try {
      const cleanTag = clanTag.replace(/^#/, '');
      const response = await fetch(
        `https://nimsraksgrdmtabainln.supabase.co/functions/v1/coc-api/clan/${encodeURIComponent(cleanTag)}`
      );
      const data = await response.json();
      
      if (response.ok) {
        setClanData(data.clan);
        toast({
          title: "Success",
          description: "Clan verified successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Clan not found on CoC API",
          variant: "destructive",
        });
        setClanData(null);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify clan",
        variant: "destructive",
      });
      setClanData(null);
    } finally {
      setVerifying(false);
    }
  };

  const handleAddAssociation = async () => {
    if (!clanData || !associationType.trim()) {
      toast({
        title: "Error",
        description: "Please verify clan and select association type",
        variant: "destructive",
      });
      return;
    }

    try {
      const selectedType = associationTypes.find(t => t.name === associationType);
      const { error } = await supabase.from("clan_associations").insert({
        clan_tag: clanData.tag,
        clan_name: clanData.name,
        association_type: associationType,
        color: selectedType?.color || "#3b82f6",
        description: description || null,
        updated_by: user.id,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Clan association added successfully!",
      });

      setClanTag("");
      setClanData(null);
      setAssociationType("");
      setDescription("");
      loadAssociations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("clan_associations")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Association deleted successfully",
      });
      loadAssociations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const [newStaffRole, setNewStaffRole] = useState<string>("staff");

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole !== 'admin' && userRole !== 'primary_admin') {
      toast({
        title: "Error",
        description: "Only admins can create staff accounts",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Store current session before signup
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      const { data: newUser, error: signUpError } = await supabase.auth.signUp({
        email: newStaffEmail,
        password: newStaffPassword,
      });

      if (signUpError) throw signUpError;

      // Re-authenticate as admin after signup auto-signs in the new user
      if (currentSession) {
        await supabase.auth.setSession({
          access_token: currentSession.access_token,
          refresh_token: currentSession.refresh_token,
        });
      }

      if (newUser.user) {
        const { error: roleError } = await supabase.from("user_roles").insert({
          user_id: newUser.user.id,
          role: newStaffRole as any,
          created_by: user.id,
        });

        if (roleError) throw roleError;

        toast({
          title: "Success",
          description: `Account created with role: ${newStaffRole}`,
        });
        setNewStaffEmail("");
        setNewStaffPassword("");
        setNewStaffRole("staff");
        loadAllUsers();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    try {
      // Delete user roles first
      const { error: roleError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      if (roleError) throw roleError;

      // Note: We can't delete from auth.users directly, but we can remove their roles
      // The profile will remain but they won't have access
      toast({
        title: "Success",
        description: "User roles removed successfully",
      });
      loadAllUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleChangeUserRole = async (userId: string, newRole: string) => {
    if (userRole !== 'primary_admin' && newRole === 'primary_admin') {
      toast({
        title: "Error",
        description: "Only primary admin can create other primary admins",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get existing roles for this user
      const { data: existingRoles } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", userId);

      // Check if user already has this role
      const hasRole = existingRoles?.some(r => r.role === newRole);
      
      if (hasRole) {
        toast({
          title: "Info",
          description: "User already has this role",
        });
        return;
      }

      // Add new role
      const { error } = await supabase
        .from("user_roles")
        .insert({
          user_id: userId,
        role: newRole as any,
          created_by: user.id,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "User role updated successfully",
      });
      setEditingUserId(null);
      setSelectedUserRole("");
      loadAllUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRemoveRole = async (userId: string, roleId: string) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", roleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Role removed successfully",
      });
      loadAllUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddAssociationType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userRole !== 'admin' && userRole !== 'primary_admin') {
      toast({
        title: "Error",
        description: "Only admins can add association types",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("association_types").insert({
        name: newTypeName,
        description: newTypeDesc || null,
        color: newTypeColor,
        created_by: user.id,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Association type added successfully!",
      });
      setNewTypeName("");
      setNewTypeDesc("");
      setNewTypeColor("#3b82f6");
      loadAssociationTypes();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteAssociationType = async (id: string) => {
    if (userRole !== 'admin' && userRole !== 'primary_admin') {
      toast({
        title: "Error",
        description: "Only admins can delete association types",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("association_types")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Association type deleted successfully",
      });
      loadAssociationTypes();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCsvUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) {
      toast({
        title: "Error",
        description: "Please select a CSV file",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const text = await csvFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      // Expected headers: clan_tag, clan_name, association_type, description
      const records = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length >= 3) {
          records.push({
            clan_tag: values[0],
            clan_name: values[1],
            association_type: values[2],
            description: values[3] || null,
            updated_by: user.id,
          });
        }
      }

      if (records.length === 0) {
        throw new Error("No valid records found in CSV");
      }

      const { error } = await supabase.from("clan_associations").insert(records);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${records.length} associations uploaded successfully!`,
      });
      setCsvFile(null);
      loadAssociations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const verifyPlayer = async () => {
    if (!playerTag.trim()) {
      toast({
        title: "Error",
        description: "Please enter a player tag",
        variant: "destructive",
      });
      return;
    }

    setVerifyingPlayer(true);
    try {
      const cleanTag = playerTag.replace(/^#/, '');
      const response = await fetch(
        `https://nimsraksgrdmtabainln.supabase.co/functions/v1/coc-api/player/${encodeURIComponent(cleanTag)}`
      );
      const data = await response.json();
      
      if (response.ok) {
        setPlayerData(data.player);
        toast({
          title: "Success",
          description: "Player verified successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Player not found on CoC API",
          variant: "destructive",
        });
        setPlayerData(null);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify player",
        variant: "destructive",
      });
      setPlayerData(null);
    } finally {
      setVerifyingPlayer(false);
    }
  };

  const handleAddPlayerAssociation = async () => {
    if (!playerData || !playerAssociationType.trim()) {
      toast({
        title: "Error",
        description: "Please verify player and select association type",
        variant: "destructive",
      });
      return;
    }

    try {
      const selectedType = associationTypes.find(t => t.name === playerAssociationType);
      const { error } = await supabase.from("player_associations").insert({
        player_tag: playerData.tag,
        player_name: playerData.name,
        association_type: playerAssociationType,
        color: selectedType?.color || "#3b82f6",
        description: playerDescription || null,
        updated_by: user.id,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Player association added successfully!",
      });

      setPlayerTag("");
      setPlayerData(null);
      setPlayerAssociationType("");
      setPlayerDescription("");
      loadPlayerAssociations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeletePlayerAssociation = async (id: string) => {
    try {
      const { error } = await supabase
        .from("player_associations")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Player association deleted successfully",
      });
      loadPlayerAssociations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Staff Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">
                Welcome, {user?.email}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {(userRole === 'admin' || userRole === 'primary_admin') && (
                <Link to="/sync-update">
                  <Button variant="outline">
                    <Clock className="h-4 w-4 mr-2" />
                    Sync Update
                  </Button>
                </Link>
              )}
              <Link to="/staff/api-docs">
                <Button variant="outline">
                  <BookOpen className="h-4 w-4 mr-2" />
                  API Docs
                </Button>
              </Link>
              <Button onClick={handleSignOut} variant="outline">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          <Tabs defaultValue="clan-associations" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="clan-associations">Clan Associations</TabsTrigger>
              <TabsTrigger value="player-associations">Player Associations</TabsTrigger>
              <TabsTrigger value="add-clan">Add Clan</TabsTrigger>
              <TabsTrigger value="add-player">Add Player</TabsTrigger>
              <TabsTrigger value="types">Types</TabsTrigger>
              {(userRole === 'admin' || userRole === 'primary_admin') && (
                <TabsTrigger value="staff">Staff</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="clan-associations">
              <Card>
                <CardHeader>
                  <CardTitle>Clan Associations</CardTitle>
                  <CardDescription>View and manage all clan associations</CardDescription>
                </CardHeader>
                <CardContent>
                  {associations.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No clan associations found</p>
                  ) : (
                    <div className="space-y-4">
                      {associations.map((assoc) => (
                        <div key={assoc.id} className="flex items-center justify-between p-4 border rounded-lg bg-card/50">
                          <div className="flex items-center gap-4">
                            <div 
                              className="w-4 h-4 rounded-full flex-shrink-0" 
                              style={{ backgroundColor: assoc.color || '#3b82f6' }}
                            />
                            <div>
                              <p className="font-semibold">{assoc.clan_name}</p>
                              <p className="text-sm text-muted-foreground">{assoc.clan_tag}</p>
                              <p className="text-sm text-primary mt-1">{assoc.association_type}</p>
                              {assoc.description && (
                                <p className="text-sm text-muted-foreground mt-1">{assoc.description}</p>
                              )}
                            </div>
                          </div>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(assoc.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="player-associations">
              <Card>
                <CardHeader>
                  <CardTitle>Player Associations</CardTitle>
                  <CardDescription>View and manage all player associations</CardDescription>
                </CardHeader>
                <CardContent>
                  {playerAssociations.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No player associations found</p>
                  ) : (
                    <div className="space-y-4">
                      {playerAssociations.map((assoc) => (
                        <div key={assoc.id} className="flex items-center justify-between p-4 border rounded-lg bg-card/50">
                          <div className="flex items-center gap-4">
                            <div 
                              className="w-4 h-4 rounded-full flex-shrink-0" 
                              style={{ backgroundColor: assoc.color || '#3b82f6' }}
                            />
                            <div>
                              <p className="font-semibold">{assoc.player_name}</p>
                              <p className="text-sm text-muted-foreground">{assoc.player_tag}</p>
                              <p className="text-sm text-primary mt-1">{assoc.association_type}</p>
                              {assoc.description && (
                                <p className="text-sm text-muted-foreground mt-1">{assoc.description}</p>
                              )}
                            </div>
                          </div>
                          <Button variant="destructive" size="sm" onClick={() => handleDeletePlayerAssociation(assoc.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="add-clan">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Step 1: Verify Clan</CardTitle>
                    <CardDescription>Clan must exist on Clash of Clans API</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-4">
                      <Input
                        placeholder="Enter clan tag (e.g., #2PP)"
                        value={clanTag}
                        onChange={(e) => setClanTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && verifyClan()}
                        className="flex-1 bg-background/50"
                      />
                      <Button onClick={verifyClan} disabled={verifying}>
                        <Search className="h-4 w-4 mr-2" />
                        {verifying ? "Verifying..." : "Verify"}
                      </Button>
                    </div>

                    {clanData && (
                      <div className="flex items-center gap-4 p-4 bg-primary/10 border border-primary/30 rounded-lg">
                        {clanData.badgeUrls?.small && (
                          <img src={clanData.badgeUrls.small} alt={`${clanData.name} badge`} className="h-12 w-12 rounded" />
                        )}
                        <div>
                          <p className="font-semibold">{clanData.name}</p>
                          <p className="text-sm text-muted-foreground">{clanData.tag}</p>
                        </div>
                        <Shield className="h-5 w-5 text-primary ml-auto" />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {clanData && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Step 2: Add Association</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="type">Association Type *</Label>
                        <Select value={associationType} onValueChange={setAssociationType}>
                          <SelectTrigger className="bg-background/50">
                            <SelectValue placeholder="Select association type" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover z-50">
                            {associationTypes.map((type) => (
                              <SelectItem key={type.id} value={type.name}>
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-3 h-3 rounded-full" 
                                    style={{ backgroundColor: type.color || '#3b82f6' }}
                                  />
                                  {type.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="desc">Description (Optional)</Label>
                        <Textarea
                          id="desc"
                          placeholder="Additional details..."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="bg-background/50"
                        />
                      </div>

                      <Button onClick={handleAddAssociation} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Association
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="add-player">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Step 1: Verify Player</CardTitle>
                    <CardDescription>Player must exist on Clash of Clans API</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-4">
                      <Input
                        placeholder="Enter player tag (e.g., #2PP)"
                        value={playerTag}
                        onChange={(e) => setPlayerTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && verifyPlayer()}
                        className="flex-1 bg-background/50"
                      />
                      <Button onClick={verifyPlayer} disabled={verifyingPlayer}>
                        <Search className="h-4 w-4 mr-2" />
                        {verifyingPlayer ? "Verifying..." : "Verify"}
                      </Button>
                    </div>

                    {playerData && (
                      <div className="flex items-center gap-4 p-4 bg-primary/10 border border-primary/30 rounded-lg">
                        <User className="h-8 w-8 text-primary" />
                        <div>
                          <p className="font-semibold">{playerData.name}</p>
                          <p className="text-sm text-muted-foreground">{playerData.tag}</p>
                        </div>
                        <Shield className="h-5 w-5 text-primary ml-auto" />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {playerData && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Step 2: Add Player Association</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="player-type">Association Type *</Label>
                        <Select value={playerAssociationType} onValueChange={setPlayerAssociationType}>
                          <SelectTrigger className="bg-background/50">
                            <SelectValue placeholder="Select association type" />
                          </SelectTrigger>
                          <SelectContent>
                            {associationTypes.map((type) => (
                              <SelectItem key={type.id} value={type.name}>
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-3 h-3 rounded-full" 
                                    style={{ backgroundColor: type.color || '#3b82f6' }}
                                  />
                                  {type.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="player-desc">Description (Optional)</Label>
                        <Textarea
                          id="player-desc"
                          placeholder="Additional details..."
                          value={playerDescription}
                          onChange={(e) => setPlayerDescription(e.target.value)}
                          className="bg-background/50"
                        />
                      </div>

                      <Button onClick={handleAddPlayerAssociation} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Player Association
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="bulk">
              <Card>
                <CardHeader>
                  <CardTitle>Bulk Upload Associations</CardTitle>
                  <CardDescription>Upload multiple associations via CSV file</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm font-medium mb-2">CSV Format:</p>
                      <code className="text-xs">clan_tag,clan_name,association_type,description</code>
                      <p className="text-xs text-muted-foreground mt-2">
                        Example: #2PP,Example Clan,Blood Alliance,Main clan
                      </p>
                    </div>

                    <form onSubmit={handleCsvUpload} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="csv-file">CSV File</Label>
                        <Input
                          id="csv-file"
                          type="file"
                          accept=".csv"
                          onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                          className="bg-background/50"
                        />
                      </div>

                      <Button type="submit" className="w-full" disabled={uploading || !csvFile}>
                        <Upload className="h-4 w-4 mr-2" />
                        {uploading ? "Uploading..." : "Upload CSV"}
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="types">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Manage Association Types</CardTitle>
                    <CardDescription>Add and manage available association types with colors</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {(userRole === 'admin' || userRole === 'primary_admin') && (
                      <form onSubmit={handleAddAssociationType} className="space-y-4 mb-6">
                        <div className="space-y-2">
                          <Label htmlFor="type-name">Type Name *</Label>
                          <Input
                            id="type-name"
                            placeholder="e.g., Blood Alliance"
                            value={newTypeName}
                            onChange={(e) => setNewTypeName(e.target.value)}
                            required
                            className="bg-background/50"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="type-color">Color *</Label>
                          <div className="flex gap-4 items-center">
                            <Input
                              id="type-color"
                              type="color"
                              value={newTypeColor}
                              onChange={(e) => setNewTypeColor(e.target.value)}
                              className="w-20 h-10"
                            />
                            <Input
                              type="text"
                              value={newTypeColor}
                              onChange={(e) => setNewTypeColor(e.target.value)}
                              placeholder="#3b82f6"
                              className="flex-1 bg-background/50"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="type-desc">Description (Optional)</Label>
                          <Textarea
                            id="type-desc"
                            placeholder="Description of this association type..."
                            value={newTypeDesc}
                            onChange={(e) => setNewTypeDesc(e.target.value)}
                            className="bg-background/50"
                          />
                        </div>

                        <Button type="submit" className="w-full">
                          <Tag className="h-4 w-4 mr-2" />
                          Add Association Type
                        </Button>
                      </form>
                    )}

                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[50px]">Color</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Description</TableHead>
                            {(userRole === 'admin' || userRole === 'primary_admin') && (
                              <TableHead className="w-[100px]">Actions</TableHead>
                            )}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {associationTypes.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center text-muted-foreground">
                                No association types found
                              </TableCell>
                            </TableRow>
                          ) : (
                            associationTypes.map((type) => (
                              <TableRow key={type.id}>
                                <TableCell>
                                  <div 
                                    className="w-8 h-8 rounded border border-border" 
                                    style={{ backgroundColor: type.color || '#3b82f6' }}
                                  />
                                </TableCell>
                                <TableCell className="font-medium">{type.name}</TableCell>
                                <TableCell className="text-muted-foreground">
                                  {type.description || "-"}
                                </TableCell>
                                {(userRole === 'admin' || userRole === 'primary_admin') && (
                                  <TableCell>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => handleDeleteAssociationType(type.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                )}
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {(userRole === 'admin' || userRole === 'primary_admin') && (
              <TabsContent value="staff">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Create User Account</CardTitle>
                      <CardDescription>Add new users with a specific role</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleCreateStaff} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="staff-email">Email</Label>
                          <Input
                            id="staff-email"
                            type="email"
                            placeholder="newuser@example.com"
                            value={newStaffEmail}
                            onChange={(e) => setNewStaffEmail(e.target.value)}
                            required
                            className="bg-background/50"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="staff-password">Password</Label>
                          <Input
                            id="staff-password"
                            type="password"
                            value={newStaffPassword}
                            onChange={(e) => setNewStaffPassword(e.target.value)}
                            required
                            minLength={6}
                            className="bg-background/50"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Role</Label>
                          <Select value={newStaffRole} onValueChange={setNewStaffRole}>
                            <SelectTrigger className="bg-background/50">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="view_sync">View Sync</SelectItem>
                              <SelectItem value="staff">Staff</SelectItem>
                              <SelectItem value="mod">Moderator</SelectItem>
                              {userRole === 'primary_admin' && (
                                <SelectItem value="admin">Admin</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        <Button type="submit" className="w-full">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Create Account
                        </Button>
                      </form>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Manage Users</CardTitle>
                      <CardDescription>View and manage all users and their roles</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {allUsers.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No users found</p>
                      ) : (
                        <div className="space-y-4">
                          {allUsers.map((userItem) => (
                            <div key={userItem.id} className="p-4 border rounded-lg bg-card/50">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <p className="font-semibold">{userItem.username}</p>
                                  <p className="text-sm text-muted-foreground">{userItem.id}</p>
                                </div>
                                {userItem.id !== user.id && (
                                  <Button 
                                    variant="destructive" 
                                    size="sm" 
                                    onClick={() => handleDeleteUser(userItem.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>

                              <div className="space-y-2">
                                <p className="text-sm font-medium">Roles:</p>
                                <div className="flex flex-wrap gap-2">
                                  {userItem.roles && userItem.roles.length > 0 ? (
                                    userItem.roles.map((role: string, idx: number) => (
                                      <div key={idx} className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full">
                                        <span className="text-sm">{role}</span>
                                        {userItem.id !== user.id && (
                                          <button
                                            onClick={() => handleRemoveRole(userItem.id, userItem.roleIds[idx])}
                                            className="text-destructive hover:text-destructive/80"
                                          >
                                            ×
                                          </button>
                                        )}
                                      </div>
                                    ))
                                  ) : (
                                    <span className="text-sm text-muted-foreground">No roles assigned</span>
                                  )}
                                </div>
                              </div>

                              {userItem.id !== user.id && (
                                <div className="mt-4 pt-4 border-t">
                                  {editingUserId === userItem.id ? (
                                    <div className="flex gap-2">
                                      <Select value={selectedUserRole} onValueChange={setSelectedUserRole}>
                                        <SelectTrigger className="flex-1">
                                          <SelectValue placeholder="Select role to add" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="view_sync">View Sync</SelectItem>
                                          <SelectItem value="staff">Staff</SelectItem>
                                          <SelectItem value="mod">Moderator</SelectItem>
                                          <SelectItem value="admin">Admin</SelectItem>
                                          {userRole === 'primary_admin' && (
                                            <SelectItem value="primary_admin">Primary Admin</SelectItem>
                                          )}
                                        </SelectContent>
                                      </Select>
                                      <Button 
                                        size="sm" 
                                        onClick={() => handleChangeUserRole(userItem.id, selectedUserRole)}
                                        disabled={!selectedUserRole}
                                      >
                                        Add
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        onClick={() => {
                                          setEditingUserId(null);
                                          setSelectedUserRole("");
                                        }}
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  ) : (
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      onClick={() => setEditingUserId(userItem.id)}
                                    >
                                      <Plus className="h-4 w-4 mr-2" />
                                      Add Role
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </main>
    </div>
  );
}
