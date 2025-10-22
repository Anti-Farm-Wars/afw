import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sword, Shield, Sparkles, Heart, Cog } from "lucide-react";

export default function Gallery() {
  const categories = [
    { id: "heroes", label: "Heroes", icon: Shield },
    { id: "troops", label: "Troops", icon: Sword },
    { id: "spells", label: "Spells", icon: Sparkles },
    { id: "pets", label: "Pets", icon: Heart },
    { id: "machines", label: "Siege Machines", icon: Cog },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              CoC Gallery
            </h1>
            <p className="text-muted-foreground">
              Browse all heroes, troops, spells, pets, and siege machines
            </p>
          </div>

          <Tabs defaultValue="heroes" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-8 bg-card">
              {categories.map((cat) => (
                <TabsTrigger key={cat.id} value={cat.id} className="gap-2">
                  <cat.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{cat.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((cat) => (
              <TabsContent key={cat.id} value={cat.id}>
                <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <cat.icon className="h-16 w-16 mx-auto mb-4 text-primary" />
                      <h3 className="text-2xl font-bold mb-2">{cat.label}</h3>
                      <p className="text-muted-foreground">
                        Gallery content will be loaded from the API
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>
    </div>
  );
}
