import { useState, useEffect } from "react";
import { useLatestScan, useVisionLogs, useVisionAnomalies, useTriggerScan } from "@/hooks/use-inventory";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ScanLine, Box, Ruler, Palette, Activity, Camera, AlertTriangle, CheckCircle, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function SmartScan() {
  const { data: latestScan } = useLatestScan();
  const { data: visionLogs } = useVisionLogs();
  const { data: anomalies } = useVisionAnomalies();
  const triggerScan = useTriggerScan();
  const [lastScanResult, setLastScanResult] = useState<{
    product_name: string;
    sku: string;
    confidence: number;
    status: string;
    bounding_box: BoundingBox;
  } | null>(null);

  const handleTriggerScan = async () => {
    try {
      const result = await triggerScan.mutateAsync();
      if (result.success) {
        setLastScanResult(result.data);
      }
    } catch (error) {
      console.error("Scan failed:", error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        handleTriggerScan();
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OK":
        return "bg-green-500";
      case "DAMAGED":
        return "bg-red-500";
      case "NON_STANDARD":
        return "bg-amber-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OK":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">OK</Badge>;
      case "DAMAGED":
        return <Badge variant="destructive">Damaged</Badge>;
      case "NON_STANDARD":
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">Non-Standard</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">YOLOv8 Vision Feed</h2>
          <p className="text-muted-foreground mt-1">
            Real-time item detection using YOLOv8 nano model with anomaly flagging.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleTriggerScan}
            disabled={triggerScan.isPending}
            data-testid="button-trigger-scan"
          >
            {triggerScan.isPending ? (
              <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Camera className="w-4 h-4 mr-2" />
            )}
            Trigger Scan
          </Button>
          <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full border border-border">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium">Live</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border shadow-lg relative overflow-hidden h-[400px] bg-zinc-950 dark:bg-black text-white">
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black" />
          
          <div className="absolute inset-0 z-10">
            <motion.div 
              className="w-full h-1 bg-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.5)]"
              animate={{ top: ["0%", "100%", "0%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute top-4 right-4 font-mono text-xs text-green-500/80">
              REC {new Date().toLocaleTimeString()}
            </div>

            <AnimatePresence>
              {lastScanResult?.bounding_box && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute border-2 border-green-500"
                  style={{
                    left: lastScanResult.bounding_box.x,
                    top: lastScanResult.bounding_box.y + 50,
                    width: lastScanResult.bounding_box.width,
                    height: lastScanResult.bounding_box.height,
                  }}
                >
                  <div className={cn(
                    "absolute -top-6 left-0 text-xs px-2 py-0.5 rounded font-mono",
                    lastScanResult.status === "OK" ? "bg-green-500" : 
                    lastScanResult.status === "DAMAGED" ? "bg-red-500" : "bg-amber-500"
                  )}>
                    {lastScanResult.sku} ({(lastScanResult.confidence * 100).toFixed(0)}%)
                  </div>
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-green-400" />
                  <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-green-400" />
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-green-400" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-green-400" />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/10">
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-green-500/50" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-green-500/50" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-green-500/50" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-green-500/50" />
            </div>
          </div>

          {!lastScanResult && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center">
              <ScanLine className="w-16 h-16 text-green-500 mx-auto opacity-80" />
              <div className="text-zinc-400 font-mono text-sm mt-4">YOLOv8n model ready</div>
              <div className="text-zinc-500 text-xs mt-1">Click "Trigger Scan" to detect items</div>
            </div>
          )}

          {lastScanResult && (
            <div className="absolute bottom-4 left-4 z-20 bg-black/80 backdrop-blur-sm border border-green-500/30 rounded-lg p-3">
              <div className="text-xs text-green-400 font-mono mb-1">DETECTED:</div>
              <div className="text-lg font-bold text-white">{lastScanResult.product_name}</div>
              <div className="flex items-center gap-2 mt-2">
                {getStatusBadge(lastScanResult.status)}
                <span className="text-xs text-zinc-400 font-mono">
                  {(lastScanResult.confidence * 100).toFixed(1)}% confidence
                </span>
              </div>
            </div>
          )}
        </Card>

        <div className="space-y-4">
          {anomalies && anomalies.length > 0 && (
            <Card className="border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-red-700 dark:text-red-400">
                  <AlertTriangle className="w-4 h-4" />
                  Anomalies Detected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {anomalies.slice(0, 3).map((log) => (
                    <div key={log.id} className="flex items-center justify-between text-sm">
                      <span className="font-mono text-xs">{log.sku}</span>
                      <Badge variant="destructive" className="text-xs">{log.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Scan History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {visionLogs && visionLogs.length > 0 ? (
                    visionLogs.slice(0, 10).map((log) => (
                      <div 
                        key={log.id} 
                        className="flex items-center justify-between text-sm py-1.5 border-b border-border/50 last:border-0"
                        data-testid={`scan-log-${log.id}`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", getStatusColor(log.status))} />
                          <span className="font-mono text-xs">{log.sku}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {log.confidenceScore && (
                            <span className="text-xs text-muted-foreground">
                              {(log.confidenceScore * 100).toFixed(0)}%
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(log.timestamp), "HH:mm:ss")}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-sm text-muted-foreground py-4">
                      No scan history yet
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {latestScan && (
        <Card className="border-l-4 border-l-primary shadow-lg overflow-hidden">
          <CardHeader className="bg-muted/20 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <Badge variant="outline" className="mb-2 bg-background">Last Inventory Scan</Badge>
                <CardTitle className="text-2xl">{latestScan.name}</CardTitle>
                <CardDescription className="font-mono mt-1">
                  SKU: {latestScan.sku}
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground font-mono">
                  {latestScan.lastScannedAt && formatDistanceToNow(new Date(latestScan.lastScannedAt), { addSuffix: true })}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 grid gap-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted/40 p-3 rounded-lg border border-border/50">
                <div className="flex items-center gap-2 mb-1 text-muted-foreground">
                  <Palette className="w-4 h-4" />
                  <span className="text-xs uppercase font-bold tracking-wider">Color</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border border-border shadow-sm" style={{ backgroundColor: latestScan.detectedColor?.toLowerCase() || 'gray' }} />
                  <span className="font-medium capitalize">{latestScan.detectedColor || 'Unknown'}</span>
                </div>
              </div>
              
              <div className="bg-muted/40 p-3 rounded-lg border border-border/50">
                <div className="flex items-center gap-2 mb-1 text-muted-foreground">
                  <Box className="w-4 h-4" />
                  <span className="text-xs uppercase font-bold tracking-wider">Texture</span>
                </div>
                <div className="font-medium capitalize">{latestScan.detectedTexture || 'Smooth'}</div>
              </div>
              
              <div className="col-span-2 bg-muted/40 p-3 rounded-lg border border-border/50">
                <div className="flex items-center gap-2 mb-1 text-muted-foreground">
                  <Ruler className="w-4 h-4" />
                  <span className="text-xs uppercase font-bold tracking-wider">Dimensions (H x W x D)</span>
                </div>
                <div className="font-mono font-medium">{latestScan.detectedDimensions || 'N/A'}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
