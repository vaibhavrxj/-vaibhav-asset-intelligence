import { useLatestScan } from "@/hooks/use-inventory";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScanLine, Box, Ruler, Palette, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

export default function SmartScan() {
  const { data: latestScan, isLoading } = useLatestScan();

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Vision Engine Feed</h2>
          <p className="text-muted-foreground mt-1">
            Real-time feed from your connected OpenCV camera system.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full border border-border">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium">Listening for scans...</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: The "Scanner" Visual */}
        <Card className="border-border shadow-lg relative overflow-hidden h-[400px] flex items-center justify-center bg-zinc-950 dark:bg-black text-white">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-10" />
          
          {/* Scanning Animation Overlay */}
          <div className="absolute inset-0 z-10">
            <motion.div 
              className="w-full h-1 bg-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.5)]"
              animate={{ top: ["0%", "100%", "0%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute top-4 right-4 font-mono text-xs text-green-500/80">
              REC ● {new Date().toLocaleTimeString()}
            </div>
            {/* Crosshairs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/20">
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-green-500" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-green-500" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-green-500" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-green-500" />
            </div>
          </div>

          <div className="z-20 text-center space-y-4">
             <ScanLine className="w-16 h-16 text-green-500 mx-auto opacity-80" />
             <div className="text-zinc-400 font-mono text-sm">Waiting for object detection...</div>
          </div>
        </Card>

        {/* Right Column: The Data Feed */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {latestScan ? (
              <motion.div
                key={latestScan.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <Card className="border-l-4 border-l-primary shadow-lg overflow-hidden">
                  <CardHeader className="bg-muted/20 pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge variant="outline" className="mb-2 bg-background">Last Scanned</Badge>
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
                    <div className="grid grid-cols-2 gap-4">
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

                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4 flex items-start gap-3">
                  <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300">Inventory Updated</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                      System automatically verified this item and updated its "Last Seen" timestamp.
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-border/60 rounded-xl bg-muted/10">
                <ScanLine className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No recent scans</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                  Items scanned by the Python Vision Engine will appear here automatically.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
