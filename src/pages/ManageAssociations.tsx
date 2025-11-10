import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Shield, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function ManageAssociations() {
  const [clanTag, setClanTag] = useState("");
  const [clanData, setClanData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [associationType, setAssociationType] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();

  const verifyClan = async () => {
    if (!clanTag.trim()) {
      toast({
        title: "Error",
        description: "Please enter a clan tag",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
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
          description: "Clan found and verified!",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Clan not found on Clash of Clans API",
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
      setLoading(false);
    }
  };

  const handleAddAssociation = async () => {
    if (!clanData) {
      toast({
        title: "Error",
        description: "Please verify a clan first",
        variant: "destructive",
      });
      return;
    }

    if (!associationType.trim()) {
      toast({
        title: "Error",
        description: "Please enter an association type",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to add associations. Redirecting to login...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = '/staff-auth';
        }, 2000);
        return;
      }

      const { error } = await supabase.from("clan_associations").insert({
        clan_tag: clanData.tag,
        clan_name: clanData.name,
        association_type: associationType,
        description: description || null,
        updated_by: user.id,
      });

      if (error) {
        if (error.code === '42501' || error.message?.includes('permission')) {
          toast({
            title: "Permission Denied",
            description: "You don't have permission to add associations. Please contact an administrator.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: "Success",
        description: "Clan association added successfully!",
      });

      // Reset form
      setClanTag("");
      setClanData(null);
      setAssociationType("");
      setDescription("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add association",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Manage Clan Associations
            </h1>
            <p className="text-muted-foreground">
              Add clan associations - clan must exist on Clash of Clans API
            </p>
          </div>

          <Card className="mb-8 bg-gradient-to-br from-card to-card/50 border-border/50 shadow-xl">
            <CardHeader>
              <CardTitle>Step 1: Verify Clan on CoC API</CardTitle>
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
                <Button onClick={verifyClan} disabled={loading}>
                  <Search className="h-4 w-4 mr-2" />
                  {loading ? "Verifying..." : "Verify"}
                </Button>
              </div>

              {clanData && (
                <div className="flex items-center gap-4 p-4 bg-primary/10 border border-primary/30 rounded-lg">
                  {clanData.badgeUrls?.small && (
                    <img 
                      src={clanData.badgeUrls.small} 
                      alt={`${clanData.name} badge`}
                      className="h-12 w-12 rounded"
                    />
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
            <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 shadow-xl">
              <CardHeader>
                <CardTitle>Step 2: Add Association Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="associationType">Association Type *</Label>
                  <Input
                    id="associationType"
                    placeholder="e.g., Blood Alliance"
                    value={associationType}
                    onChange={(e) => setAssociationType(e.target.value)}
                    className="bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Additional details about this association..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-background/50 min-h-[100px]"
                  />
                </div>

                <div className="flex items-start gap-2 p-4 bg-muted/50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    Only verified clans from the Clash of Clans API can receive associations.
                    This ensures data accuracy and prevents invalid entries.
                  </p>
                </div>

                <Button 
                  onClick={handleAddAssociation} 
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? "Adding..." : "Add Association"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
