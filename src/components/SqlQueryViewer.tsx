import { useState } from "react";
import { Code, ChevronDown, ChevronUp, Copy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

interface SqlQueryViewerProps {
  queries: Array<{
    id: string;
    timestamp: Date;
    query: string;
    duration?: number;
    source?: string;
  }>;
}

const SqlQueryViewer = ({ queries }: SqlQueryViewerProps) => {
  const [expanded, setExpanded] = useState(false);
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Query copied to clipboard",
      duration: 2000,
    });
  };

  return (
    <Card className="mt-6">
      <CardHeader 
        className="flex flex-row items-center justify-between py-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <CardTitle className="flex items-center text-md font-medium">
          <Code className="mr-2 h-4 w-4" />
          SQL Queries {queries.length > 0 && `(${queries.length})`}
        </CardTitle>
        <Button variant="ghost" size="sm">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CardHeader>
      
      {expanded && (
        <CardContent className="pt-0">
          {queries.length > 0 ? (
            <div className="space-y-3">
              {queries.map((query) => (
                <div 
                  key={query.id} 
                  className="rounded-md border bg-muted/50 p-3"
                >
                  <div className="flex justify-between items-center mb-1 text-xs text-muted-foreground">
                    <div>
                      {query.timestamp.toLocaleTimeString()} 
                      {query.source && <span className="ml-2">• {query.source}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      {query.duration && <span>{query.duration}ms</span>}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(query.query);
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <pre className="text-xs overflow-x-auto p-1">{query.query}</pre>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No SQL queries recorded yet
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default SqlQueryViewer;