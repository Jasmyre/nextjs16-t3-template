import { Card, CardContent, CardHeader } from "@/components/ui/card";

const page = () => (
  <main className="flex min-h-screen items-center justify-center">
    <Card className="h-max w-max">
      <CardHeader />
      <CardContent>
        <h1 className="text-center font-bold text-3xl">Maintenance</h1>
        <p className="mt-4">
          The website is currently in maintenance, please comeback later.
        </p>
      </CardContent>
    </Card>
  </main>
);

export default page;
