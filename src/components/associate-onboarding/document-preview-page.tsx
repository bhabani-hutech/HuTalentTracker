import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Download } from "lucide-react";

export function DocumentPreviewPage() {
  // Mock documents - in real app would fetch based on ID from URL
  const documents = [
    {
      id: "1",
      name: "Signed Offer Letter",
      type: "PDF",
      signedDate: "2024-03-25",
      size: "2.5 MB",
      preview: "https://api.dicebear.com/7.x/avataaars/svg?seed=1", // Replace with actual document preview
    },
    {
      id: "2",
      name: "Signed NDA",
      type: "PDF",
      signedDate: "2024-03-24",
      size: "1.8 MB",
      preview: "https://api.dicebear.com/7.x/avataaars/svg?seed=2", // Replace with actual document preview
    },
  ];

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Document Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {documents.map((doc) => (
              <div key={doc.id} className="border rounded-lg p-4 space-y-4">
                <div className="aspect-[3/4] bg-muted rounded-md overflow-hidden">
                  <img
                    src={doc.preview}
                    alt={doc.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">{doc.name}</h3>
                  <div className="flex gap-2 text-sm text-muted-foreground">
                    <span>{doc.type}</span>
                    <span>•</span>
                    <span>{doc.size}</span>
                    <span>•</span>
                    <span>Signed on {doc.signedDate}</span>
                  </div>
                  <Button className="w-full" variant="outline">
                    <Download className="h-4 w-4 mr-2" /> Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
