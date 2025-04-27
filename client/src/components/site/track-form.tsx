import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Logo } from "@/components/ui/logo";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { Check } from "lucide-react";
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
  const [scrapeResult, setScrapeResult] = useState<any | null>(null);

  const getCsvDownloadUrl = (song: string, artist: string) => {
    return `http://139.59.140.159:8000/download?song=${encodeURIComponent(song)}&artist=${encodeURIComponent(artist)}`;
  };

  const form = useForm<TrackFormValues>({
    resolver: zodResolver(trackFormSchema),
    defaultValues: {
      song_name: "",
      artist: ""
    }
  });

  const mutation = useMutation({
    mutationFn: async (values: TrackFormValues) => {
      const res = await apiRequest('POST', 'https://expresserverjs.onrender.com/scrape', {
        song_name: values.song_name,
        artist: values.artist
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.spotontrack?.spotontrack_spotify_image) {
        data.spotontrack.spotontrack_spotify_image = data.spotontrack.spotontrack_spotify_image.replace(
            "http://localhost:8000/images/",
            "https://expresserverjs.onrender.com/images/"
        );
      }
      if (data.mediaforest?.mediaforest_image_url) {
        data.mediaforest.mediaforest_image_url = data.mediaforest.mediaforest_image_url.replace(
            "http://localhost:8000/images/",
            "https://expresserverjs.onrender.com/images/"
        );
      }


      setScrapeResult(data);
      form.reset();
      setSuccessMessage(true);
      setTimeout(() => setSuccessMessage(false), 5000);
    },

    onError: () => {
      setSuccessMessage(true);
      setTimeout(() => setSuccessMessage(false), 5000);
    }
  });

  function onSubmit(values: TrackFormValues) {
    mutation.mutate(values);
  }

  const sendEmailReport = async () => {
    if (!scrapeResult) return;

    const toBase64 = async (url: string) => {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    };

    try {
      const spotontrackImageBase64 = scrapeResult.spotontrack?.spotontrack_spotify_image
          ? await toBase64(scrapeResult.spotontrack.spotontrack_spotify_image)
          : "";

      const mediaforestImageBase64 = scrapeResult.mediaforest?.mediaforest_image_url
          ? await toBase64(scrapeResult.mediaforest.mediaforest_image_url)
          : "";

      const tiktokCsvBase64 = scrapeResult.tiktok_csv_base64 || "";


      await fetch("https://musicinsight-emailer.onrender.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          song_name: scrapeResult.song,
          artist: scrapeResult.artist,
          youtube_title: scrapeResult.youtube?.["Youtube title"] || "-",
          youtube_views: scrapeResult.youtube?.["Youtube views"] || "-",
          spotify_title: scrapeResult.spotify?.["Spotify title"] || "-",
          spotify_streams: scrapeResult.spotify?.["Spotify streams"] || "-",
          shazam_count: scrapeResult.shazam?.["Shazam count"] || "-",
          chartex_stats: scrapeResult.chartex?.chartexStats || "-",
          spotontrack_image_base64: spotontrackImageBase64,
          mediaforest_image_base64: mediaforestImageBase64,
          tiktok_csv_base64: tiktokCsvBase64
        })
      });

      alert("✅ Email sent successfully!");
    } catch (err) {
      console.error("❌ Failed to send email:", err);
      alert("Something went wrong when sending the email.");
    }
  };

  return (
      <div className="w-full max-w-md mx-auto relative">
        <div className="bg-card rounded-xl shadow-xl p-8 backdrop-blur-sm relative overflow-hidden border border-neutral-800">
          <div className="absolute inset-0 bg-gradient-radial from-accent/5 to-transparent opacity-70"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-center mb-6">
              <Logo size="lg" className="shadow-[0_0_15px_rgba(62,99,221,0.15)]" />
            </div>
            <h2 className="text-2xl font-medium text-center mb-8 tracking-wide">Track Analysis</h2>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                    control={form.control}
                    name="song_name"
                    render={({ field }) => (
                        <FormItem className="space-y-2">
                          <FormLabel className="text-sm font-medium text-neutral-300">Song Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter song name" className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-accent focus:ring-accent/30" />
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
                            <Input {...field} placeholder="Enter artist name" className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-accent focus:ring-accent/30" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="pt-3">
                  <Button type="submit" disabled={mutation.isPending} className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-none hover:shadow-[0_0_20px_rgba(10,228,179,0.3)] transition-all duration-300">
                    {mutation.isPending ? "Processing..." : "Analyze Track"}
                  </Button>
                </div>
              </form>
            </Form>

            {successMessage && (
                <Alert className="mt-6 bg-accent/10 border border-accent/20 animate-in fade-in slide-in-from-top-5 duration-300">
                  <Check className="h-4 w-4 text-accent" />
                  <AlertDescription className="text-accent text-sm">
                    Scraping started. Please check your email for the report.
                  </AlertDescription>
                </Alert>
            )}

            {scrapeResult && (
                <div className="mt-6 bg-neutral-900 border border-neutral-700 p-4 rounded-lg text-sm text-white space-y-6">
                  {scrapeResult.youtube && (
                      <div>
                        <strong>YouTube</strong><br />
                        Title: {scrapeResult.youtube["Youtube title"]}<br />
                        Views: {scrapeResult.youtube["Youtube views"]}
                      </div>
                  )}
                  {scrapeResult.spotify && (
                      <div>
                        <strong>Spotify</strong><br />
                        Title: {scrapeResult.spotify["Spotify title"]}<br />
                        Streams: {scrapeResult.spotify["Spotify streams"]}
                      </div>
                  )}
                  {scrapeResult.shazam && (
                      <div>
                        <strong>Shazam</strong><br />
                        Count: {scrapeResult.shazam["Shazam count"]}
                      </div>
                  )}
                  {scrapeResult.chartex && (
                      <div>
                        <strong>Chartex</strong>
                        <p className="mt-2">Stats: {scrapeResult.chartex.chartexStats}</p>
                        <a href={getCsvDownloadUrl(scrapeResult.song, scrapeResult.artist)} download className="inline-block mt-4 bg-accent text-white text-sm px-4 py-2 rounded hover:bg-accent/90 transition">
                          Download TikTok CSV
                        </a>
                      </div>
                  )}
                  {scrapeResult.mediaforest?.mediaforest_image_url && (
                      <div>
                        <strong>Mediaforest</strong>
                        <div className="mt-2 border border-neutral-700 rounded-lg overflow-hidden">
                          <img src={scrapeResult.mediaforest.mediaforest_image_url} alt="Mediaforest Chart" className="w-full object-contain rounded" />
                        </div>
                      </div>
                  )}
                  {scrapeResult.spotontrack?.spotontrack_spotify_image && (
                      <div>
                        <strong>Spotontrack - SpotifyPlaylists</strong>
                        <div className="mt-2 border border-neutral-700 rounded-lg overflow-hidden">
                          <img src={scrapeResult.spotontrack.spotontrack_spotify_image} alt="Spotontrack Spotify Playlists" className="w-full object-contain rounded" />
                        </div>
                      </div>
                  )}
                  <Button onClick={sendEmailReport} className="w-full bg-green-600 hover:bg-green-700 mt-4">
                    📩 Send Report by Email
                  </Button>
                </div>
            )}
          </div>
        </div>
      </div>
  );
}
