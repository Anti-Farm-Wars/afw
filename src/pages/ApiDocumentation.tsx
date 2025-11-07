import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Database, Code, Key } from "lucide-react";

export default function ApiDocumentation() {
  const [isStaff, setIsStaff] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkStaffAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/staff");
        return;
      }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      const hasStaffRole = roles?.some(r => 
        ["primary_admin", "admin", "staff"].includes(r.role)
      );

      if (!hasStaffRole) {
        navigate("/");
        return;
      }

      setIsStaff(true);
      setLoading(false);
    };

    checkStaffAccess();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isStaff) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">Association API Documentation</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Complete reference for AFW association management APIs - Staff Access Only
            </p>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="clan">Clan APIs</TabsTrigger>
              <TabsTrigger value="player">Player APIs</TabsTrigger>
              <TabsTrigger value="types">Association Types</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Authentication
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Required Authentication</h3>
                    <p className="text-muted-foreground mb-4">
                      All API operations require authentication using Supabase client with valid JWT token.
                    </p>
                    <div className="bg-muted p-4 rounded-lg">
                      <code className="text-sm">
                        const &#123; data, error &#125; = await supabase<br/>
                        &nbsp;&nbsp;.from('clan_associations')<br/>
                        &nbsp;&nbsp;.select('*');
                      </code>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Permission Levels</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge>Primary Admin</Badge>
                        <span className="text-sm text-muted-foreground">Full CRUD access to all resources</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Admin</Badge>
                        <span className="text-sm text-muted-foreground">Create staff roles, manage associations</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Staff</Badge>
                        <span className="text-sm text-muted-foreground">Insert/Update associations, view roles</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Base Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold mb-2">Supabase Client Import:</p>
                      <div className="bg-muted p-4 rounded-lg">
                        <code className="text-sm">
                          import &#123; supabase &#125; from "@/integrations/supabase/client";
                        </code>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-2">Project Details:</p>
                      <div className="bg-muted p-4 rounded-lg space-y-1">
                        <p className="text-sm"><strong>Project ID:</strong> nimsraksgrdmtabainln</p>
                        <p className="text-sm"><strong>Tables:</strong> clan_associations, player_associations, association_types</p>
                        <p className="text-sm"><strong>RLS:</strong> Enabled on all tables</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="clan" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Clan Associations API</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Badge>GET</Badge> Fetch All Clan Associations
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">Retrieve all clan associations (public access)</p>
                    <div className="bg-muted p-4 rounded-lg">
                      <code className="text-sm whitespace-pre">
{`const { data, error } = await supabase
  .from('clan_associations')
  .select('*')
  .order('created_at', { ascending: false });`}
                      </code>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Badge variant="secondary">POST</Badge> Create Clan Association
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">Add new clan association (staff required)</p>
                    <div className="bg-muted p-4 rounded-lg">
                      <code className="text-sm whitespace-pre">
{`const { data, error } = await supabase
  .from('clan_associations')
  .insert({
    clan_tag: '#2PP',
    clan_name: 'Example Clan',
    association_type: 'Official',
    description: 'Main clan',
    color: '#3b82f6'
  })
  .select();`}
                      </code>
                    </div>
                    <div className="mt-3 p-3 bg-accent rounded-lg">
                      <p className="text-sm font-semibold mb-2">Required Fields:</p>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• <code>clan_tag</code> (text) - Clan tag identifier</li>
                        <li>• <code>clan_name</code> (text) - Display name</li>
                        <li>• <code>association_type</code> (text) - Type of association</li>
                      </ul>
                      <p className="text-sm font-semibold mt-2 mb-2">Optional Fields:</p>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• <code>description</code> (text) - Additional details</li>
                        <li>• <code>color</code> (text) - Hex color code</li>
                        <li>• <code>association_type_id</code> (uuid) - FK to association_types</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Badge variant="secondary">PUT</Badge> Update Clan Association
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">Modify existing association (staff required)</p>
                    <div className="bg-muted p-4 rounded-lg">
                      <code className="text-sm whitespace-pre">
{`const { data, error } = await supabase
  .from('clan_associations')
  .update({
    description: 'Updated description',
    color: '#ef4444'
  })
  .eq('id', 'uuid-here')
  .select();`}
                      </code>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Badge variant="destructive">DELETE</Badge> Delete Clan Association
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">Remove association (admin required)</p>
                    <div className="bg-muted p-4 rounded-lg">
                      <code className="text-sm whitespace-pre">
{`const { error } = await supabase
  .from('clan_associations')
  .delete()
  .eq('id', 'uuid-here');`}
                      </code>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="player" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Player Associations API</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Badge>GET</Badge> Fetch All Player Associations
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">Retrieve all player associations (public access)</p>
                    <div className="bg-muted p-4 rounded-lg">
                      <code className="text-sm whitespace-pre">
{`const { data, error } = await supabase
  .from('player_associations')
  .select('*')
  .order('created_at', { ascending: false });`}
                      </code>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Badge variant="secondary">POST</Badge> Create Player Association
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">Add new player association (staff required)</p>
                    <div className="bg-muted p-4 rounded-lg">
                      <code className="text-sm whitespace-pre">
{`const { data, error } = await supabase
  .from('player_associations')
  .insert({
    player_tag: '#ABC123',
    player_name: 'PlayerName',
    association_type: 'VIP',
    description: 'Top player',
    color: '#22c55e'
  })
  .select();`}
                      </code>
                    </div>
                    <div className="mt-3 p-3 bg-accent rounded-lg">
                      <p className="text-sm font-semibold mb-2">Required Fields:</p>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• <code>player_tag</code> (text) - Player tag identifier</li>
                        <li>• <code>player_name</code> (text) - Display name</li>
                        <li>• <code>association_type</code> (text) - Type (default: 'General')</li>
                      </ul>
                      <p className="text-sm font-semibold mt-2 mb-2">Optional Fields:</p>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• <code>description</code> (text) - Additional details</li>
                        <li>• <code>color</code> (text) - Hex color code</li>
                        <li>• <code>association_type_id</code> (uuid) - FK to association_types</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Badge variant="secondary">PUT</Badge> Update Player Association
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">Modify existing association (staff required)</p>
                    <div className="bg-muted p-4 rounded-lg">
                      <code className="text-sm whitespace-pre">
{`const { data, error } = await supabase
  .from('player_associations')
  .update({
    description: 'Updated description',
    association_type: 'Elite'
  })
  .eq('id', 'uuid-here')
  .select();`}
                      </code>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Badge variant="destructive">DELETE</Badge> Delete Player Association
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">Remove association (admin required)</p>
                    <div className="bg-muted p-4 rounded-lg">
                      <code className="text-sm whitespace-pre">
{`const { error } = await supabase
  .from('player_associations')
  .delete()
  .eq('id', 'uuid-here');`}
                      </code>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="types" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Association Types API</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Badge>GET</Badge> Fetch All Association Types
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">Retrieve all association types (public access)</p>
                    <div className="bg-muted p-4 rounded-lg">
                      <code className="text-sm whitespace-pre">
{`const { data, error } = await supabase
  .from('association_types')
  .select('*')
  .order('name');`}
                      </code>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Badge variant="secondary">POST</Badge> Create Association Type
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">Add new type (primary admin only)</p>
                    <div className="bg-muted p-4 rounded-lg">
                      <code className="text-sm whitespace-pre">
{`const { data: { user } } = await supabase.auth.getUser();

const { data, error } = await supabase
  .from('association_types')
  .insert({
    name: 'Elite',
    description: 'Elite tier associations',
    color: '#8b5cf6',
    created_by: user.id
  })
  .select();`}
                      </code>
                    </div>
                    <div className="mt-3 p-3 bg-accent rounded-lg">
                      <p className="text-sm font-semibold mb-2">Required Fields:</p>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• <code>name</code> (text) - Type name</li>
                      </ul>
                      <p className="text-sm font-semibold mt-2 mb-2">Optional Fields:</p>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• <code>description</code> (text) - Type description</li>
                        <li>• <code>color</code> (text) - Hex color (default: '#3b82f6')</li>
                        <li>• <code>created_by</code> (uuid) - Creator user ID</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Badge variant="destructive">DELETE</Badge> Delete Association Type
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">Remove type (primary admin only)</p>
                    <div className="bg-muted p-4 rounded-lg">
                      <code className="text-sm whitespace-pre">
{`const { error } = await supabase
  .from('association_types')
  .delete()
  .eq('id', 'uuid-here');`}
                      </code>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Error Handling
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      All operations return an error object if the operation fails:
                    </p>
                    <div className="bg-muted p-4 rounded-lg">
                      <code className="text-sm whitespace-pre">
{`const { data, error } = await supabase
  .from('clan_associations')
  .select('*');

if (error) {
  console.error('Error:', error.message);
  // Handle error (e.g., show toast notification)
} else {
  console.log('Success:', data);
}`}
                      </code>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm font-semibold mb-2">Common Error Scenarios:</p>
                      <ul className="text-sm space-y-2 text-muted-foreground">
                        <li>• <strong>Insufficient permissions:</strong> User lacks required role</li>
                        <li>• <strong>RLS policy violation:</strong> Operation blocked by security policies</li>
                        <li>• <strong>Invalid data:</strong> Required fields missing or wrong type</li>
                        <li>• <strong>Not authenticated:</strong> User not logged in</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
