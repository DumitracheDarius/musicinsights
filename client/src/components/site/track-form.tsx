import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Logo } from "@/components/ui/logo";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, Check } from "lucide-react";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

const trackFormSchema = z.object({
  song_name: z.string().min(1, "Song name is required"),
  artist: z.string().min(1, "Artist name is required")
});

type TrackFormValues = z.infer<typeof trackFormSchema>;

export function TrackForm() {
  const [successMessage, setSuccessMessage] = useState(false);

  const form = useForm<TrackFormValues>({
    resolver: zodResolver(trackFormSchema),
    defaultValues: {
      song_name: "",
      artist: ""
    }
  });

  const mutation = useMutation({
    mutationFn: async (values: TrackFormValues) => {
      const formData = new URLSearchParams();
      formData.append('song_name', values.song_name);
      formData.append('artist', values.artist);
      
      return apiRequest('POST', 'http://localhost:8000/scrape', formData);
    },
    onSuccess: () => {
      form.reset();
      setSuccessMessage(true);
      setTimeout(() => setSuccessMessage(false), 5000);
    },
    onError: () => {
      // Even on error, we'll show the success message as per requirements
      setSuccessMessage(true);
      setTimeout(() => setSuccessMessage(false), 5000);
    }
  });

  function onSubmit(values: TrackFormValues) {
    mutation.mutate(values);
  }

  return (
    <div className="w-full max-w-md mx-auto relative">
      <div className="bg-card rounded-xl shadow-xl p-8 backdrop-blur-sm relative overflow-hidden border border-neutral-800">
        {/* Card glow effect */}
        <div className="absolute inset-0 bg-gradient-radial from-accent/5 to-transparent opacity-70"></div>
        
        {/* Card content */}
        <div className="relative z-10">
          <div className="flex items-center justify-center mb-6">
            <Logo size="lg" className="shadow-[0_0_15px_rgba(62,99,221,0.15)]" />
          </div>
          
          <h2 className="text-2xl font-medium text-center mb-8 tracking-wide">Track Analysis</h2>
          
          {/* Input Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="song_name"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-medium text-neutral-300">Song Name</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Enter song name" 
                        className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-accent focus:ring-accent/30"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="artist"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-medium text-neutral-300">Artist</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Enter artist name" 
                        className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-accent focus:ring-accent/30"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="pt-3">
                <Button 
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-none hover:shadow-[0_0_20px_rgba(10,228,179,0.3)] transition-all duration-300"
                >
                  {mutation.isPending ? "Processing..." : "Analyze Track"}
                </Button>
              </div>
            </form>
          </Form>
          
          {/* Success message */}
          {successMessage && (
            <Alert className="mt-6 bg-accent/10 border border-accent/20 animate-in fade-in slide-in-from-top-5 duration-300">
              <Check className="h-4 w-4 text-accent" />
              <AlertDescription className="text-accent text-sm">
                Scraping started. Please check your email for the report.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
