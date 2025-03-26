
import { useState } from "react";
import { Code, ChevronDown, ChevronUp, Copy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

interface SqlQuery {
  id: string;
  timestamp: Date;
  query: string;
  duration?: number;
  source?: string;
}

interface SqlQueryViewerProps {
  queries?: Array<SqlQuery>;
  query?: string; // Added for backward compatibility
}

const SqlQueryViewer = ({ queries, query }: SqlQueryViewerProps) => {
  const [expanded, setExpanded] = useState(false);
  
  // Convert single query to proper format if provided
  const formattedQueries: SqlQuery[] = query 
    ? [{ 
        id: crypto.randomUUID(), 
        timestamp: new Date(), 
        query 
      }] 
    : queries || [];
  
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
          SQL Queries {formattedQueries.length > 0 && `(${formattedQueries.length})`}
        </CardTitle>
        <Button variant="ghost" size="sm">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CardHeader>
      
      {expanded && (
        <CardContent className="pt-0">
          {formattedQueries.length > 0 ? (
            <div className="space-y-3">
              {formattedQueries.map((queryItem) => (
                <div 
                  key={queryItem.id} 
                  className="rounded-md border bg-muted/50 p-3"
                >
                  <div className="flex justify-between items-center mb-1 text-xs text-muted-foreground">
                    <div>
                      {queryItem.timestamp.toLocaleTimeString()} 
                      {queryItem.source && <span className="ml-2">• {queryItem.source}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      {queryItem.duration && <span>{queryItem.duration}ms</span>}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(queryItem.query);
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <pre className="text-xs overflow-x-auto p-1">{queryItem.query}</pre>
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
