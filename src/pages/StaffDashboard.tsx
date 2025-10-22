import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LogOut, Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function StaffDashboard() {
  const [user, setUser] = useState<any>(null);
  const [associations, setAssociations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [clanTag, setClanTag] = useState("");
  const [clanName, setClanName] = useState("");
  const [associationType, setAssociationType] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
    loadAssociations();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
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
    setLoading(false);
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/staff");
  };

  const handleAddAssociation = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("clan_associations").insert({
      clan_tag: clanTag,
      clan_name: clanName,
      association_type: associationType,
      description: description || null,
      updated_by: user?.id,
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Association added successfully",
      });
      setClanTag("");
      setClanName("");
      setAssociationType("");
      setDescription("");
      loadAssociations();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("clan_associations")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Association deleted",
      });
      loadAssociations();
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Staff Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">
                Logged in as: {user?.email}
              </p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add Clan Association
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddAssociation} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="clan-tag">Clan Tag</Label>
                    <Input
                      id="clan-tag"
                      placeholder="#2PP"
                      value={clanTag}
                      onChange={(e) => setClanTag(e.target.value)}
                      required
                      className="bg-background/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clan-name">Clan Name</Label>
                    <Input
                      id="clan-name"
                      placeholder="Blood Alliance"
                      value={clanName}
                      onChange={(e) => setClanName(e.target.value)}
                      required
                      className="bg-background/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="association-type">Association Type</Label>
                    <Input
                      id="association-type"
                      placeholder="e.g., Official Partner, Sister Clan"
                      value={associationType}
                      onChange={(e) => setAssociationType(e.target.value)}
                      required
                      className="bg-background/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Additional information..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="bg-background/50"
                    />
                  </div>

                  <Button type="submit" className="w-full" variant="hero">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Association
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
              <CardHeader>
                <CardTitle>Current Associations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {associations.map((assoc) => (
                    <div
                      key={assoc.id}
                      className="p-4 bg-background/50 rounded-lg border border-border/50"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">{assoc.clan_name}</h3>
                          <p className="text-sm text-muted-foreground">{assoc.clan_tag}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(assoc.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <p className="text-sm text-primary font-medium mb-1">
                        {assoc.association_type}
                      </p>
                      {assoc.description && (
                        <p className="text-sm text-muted-foreground">
                          {assoc.description}
                        </p>
                      )}
                    </div>
                  ))}
                  {associations.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No associations yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
