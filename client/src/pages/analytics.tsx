import { useForecast, useProducts, useReorderProduct } from "@/hooks/use-inventory";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area
} from "recharts";
import { TrendingUp, AlertTriangle, Package, RefreshCcw, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function Analytics() {
  const { data: forecasts, isLoading: forecastLoading } = useForecast();
  const { data: products } = useProducts();
  const reorderProduct = useReorderProduct();
  const { toast } = useToast();

  const handleReorder = (productId: number, productName: string) => {
    reorderProduct.mutate({ id: productId, quantity: 50 }, {
      onSuccess: () => {
        toast({
          title: "Reorder Placed",
          description: `Successfully ordered 50 units of ${productName}`,
        });
      },
      onError: () => {
        toast({
          title: "Reorder Failed",
          description: "Could not place the reorder. Please try again.",
          variant: "destructive"
        });
      }
    });
  };

  const needsReorderProducts = forecasts?.filter(f => f.needs_reorder) || [];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Predictive Analytics</h2>
        <p className="text-muted-foreground mt-1">
          AI-powered demand forecasting and stock predictions.
        </p>
      </div>

      {needsReorderProducts.length > 0 && (
        <Card className="border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
              Reorder Alerts
            </CardTitle>
            <CardDescription>
              Products predicted to run low within 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {needsReorderProducts.map((product) => (
                <Card 
                  key={product.product_id} 
                  className="bg-background border-red-100 dark:border-red-900/50"
                  data-testid={`card-reorder-${product.product_id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold">{product.product_name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{product.sku}</p>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Package className="h-3 w-3" />
                            <span>Current: {product.current_stock} units</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                            <TrendingUp className="h-3 w-3" />
                            <span>7-day demand: {product.total_predicted_demand} units</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReorder(product.product_id, product.product_name)}
                        disabled={reorderProduct.isPending}
                        data-testid={`button-reorder-${product.product_id}`}
                      >
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        Reorder
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {forecastLoading ? (
          <Card className="col-span-2">
            <CardContent className="flex items-center justify-center h-64">
              <RefreshCcw className="h-8 w-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ) : (
          forecasts?.map((forecast) => {
            const chartData = [
              { day: "Today", actual: forecast.current_stock, predicted: forecast.current_stock },
              ...forecast.predictions.map(p => ({
                day: `Day ${p.day}`,
                actual: null,
                predicted: p.predicted_stock,
                demand: p.predicted_demand
              }))
            ];

            return (
              <Card 
                key={forecast.product_id} 
                className={cn(
                  "shadow-sm",
                  forecast.needs_reorder && "border-red-200 dark:border-red-900"
                )}
                data-testid={`card-forecast-${forecast.product_id}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{forecast.product_name}</CardTitle>
                      <CardDescription className="font-mono text-xs">{forecast.sku}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {forecast.needs_reorder ? (
                        <Badge variant="destructive">Low Stock</Badge>
                      ) : (
                        <Badge variant="secondary">Healthy</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-4 mt-2">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Current:</span>{" "}
                      <span className="font-semibold">{forecast.current_stock} units</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">7-day demand:</span>{" "}
                      <span className="font-semibold text-primary">{forecast.total_predicted_demand} units</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id={`gradient-${forecast.product_id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="day" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false}
                          stroke="#888"
                        />
                        <YAxis 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false}
                          stroke="#888"
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            borderColor: 'hsl(var(--border))',
                            borderRadius: '8px',
                            fontSize: '12px'
                          }}
                        />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="predicted" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          fill={`url(#gradient-${forecast.product_id})`}
                          name="Predicted Stock"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="actual" 
                          stroke="hsl(var(--accent-foreground))" 
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={{ fill: "hsl(var(--accent-foreground))" }}
                          name="Actual Stock"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  {forecast.needs_reorder && (
                    <div className="mt-4 flex justify-end">
                      <Button
                        size="sm"
                        onClick={() => handleReorder(forecast.product_id, forecast.product_name)}
                        disabled={reorderProduct.isPending}
                        data-testid={`button-quick-reorder-${forecast.product_id}`}
                      >
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        One-Click Reorder
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
