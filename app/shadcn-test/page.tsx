import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ShadcnTestPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Prueba de shadcn/ui</CardTitle>
          <CardDescription>
            Si ves esto con estilo, shadcn está funcionando.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" placeholder="Tu nombre" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo</Label>
            <Input id="email" type="email" placeholder="tu@correo.com" />
          </div>
          <div className="flex gap-2 bg-accent">
            <Button variant="outline">Cancelar</Button>
            <Button>Guardar</Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}