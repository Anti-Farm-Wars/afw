import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, LogOut, Trash2, UserPlus, Search, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function StaffDashboard() {
  const [user, setUser] = useState<any>(null);
  const [associations, setAssociations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [clanTag, setClanTag] = useState("");
  const [clanData, setClanData] = useState<any>(null);
  const [verifying, setVerifying] = useState(false);
  const [associationType, setAssociationType] = useState("");
  const [description, setDescription] = useState("");
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffPassword, setNewStaffPassword] = useState("");
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
    loadAssociations();
    setLoading(false);
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
        description: "Please verify clan and enter association type",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("clan_associations").insert({
        clan_tag: clanData.tag,
        clan_name: clanData.name,
        association_type: associationType,
        description: description || null,
        updated_by: user.id,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Association added successfully!",
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

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
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
          role: "staff",
          created_by: user.id,
        });

        if (roleError) throw roleError;

        toast({
          title: "Success",
          description: "Staff account created successfully!",
        });
        setNewStaffEmail("");
        setNewStaffPassword("");
      }
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
            <Button onClick={handleSignOut} variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>

          <Tabs defaultValue="associations" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="associations">Manage Associations</TabsTrigger>
              <TabsTrigger value="add">Add Association</TabsTrigger>
              <TabsTrigger value="staff">Create Staff</TabsTrigger>
            </TabsList>

            <TabsContent value="associations">
              <Card>
                <CardHeader>
                  <CardTitle>Current Associations</CardTitle>
                  <CardDescription>View and manage all clan associations</CardDescription>
                </CardHeader>
                <CardContent>
                  {associations.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No associations found</p>
                  ) : (
                    <div className="space-y-4">
                      {associations.map((assoc) => (
                        <div key={assoc.id} className="flex items-center justify-between p-4 border rounded-lg bg-card/50">
                          <div>
                            <p className="font-semibold">{assoc.clan_name}</p>
                            <p className="text-sm text-muted-foreground">{assoc.clan_tag}</p>
                            <p className="text-sm text-primary mt-1">{assoc.association_type}</p>
                            {assoc.description && (
                              <p className="text-sm text-muted-foreground mt-1">{assoc.description}</p>
                            )}
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

            <TabsContent value="add">
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
                        <Input
                          id="type"
                          placeholder="e.g., Blood Alliance"
                          value={associationType}
                          onChange={(e) => setAssociationType(e.target.value)}
                          className="bg-background/50"
                        />
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

            <TabsContent value="staff">
              <Card>
                <CardHeader>
                  <CardTitle>Create Staff Account</CardTitle>
                  <CardDescription>Add new staff members who can manage associations</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateStaff} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="staff-email">Email</Label>
                      <Input
                        id="staff-email"
                        type="email"
                        placeholder="newstaff@example.com"
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

                    <Button type="submit" className="w-full">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Create Staff Account
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
