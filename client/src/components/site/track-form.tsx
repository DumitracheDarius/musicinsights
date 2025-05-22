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
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from "recharts";

const trackFormSchema = z.object({
  song_name: z.string().min(1, "Song name is required"),
  song_name_diacritics: z.string().optional(),
  artist: z.string().min(1, "Artist name is required")
});

type TrackFormValues = z.infer<typeof trackFormSchema>;

export function TrackForm() {
  const [successMessage, setSuccessMessage] = useState(false);
  const [scrapeResult, setScrapeResult] = useState<any | null>(null);
  const [showDiacritics, setShowDiacritics] = useState(false);

  const getCsvDownloadUrl = (song: string, artist: string) => {
    return `https://expresserverjs.onrender.com/download?song=${encodeURIComponent(song)}&artist=${encodeURIComponent(artist)}`;
  };

  const form = useForm<TrackFormValues>({
    resolver: zodResolver(trackFormSchema),
    defaultValues: {
      song_name: "",
      song_name_diacritics: "",
      artist: ""
    }
  });

  const mutation = useMutation({
    mutationFn: async (values: TrackFormValues) => {
      setScrapeResult(null);
      
      const res = await apiRequest('POST', 'https://expresserverjs.onrender.com/scrape', {
        song_name: values.song_name,
        song_name_diacritics: values.song_name_diacritics || "",
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

      await fetch("https://musicinsight-emailer.onrender.com/send-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          song_name: scrapeResult.song,
          artist: scrapeResult.artist,
          spotify_title: scrapeResult.spotify?.["Spotify title"] || "-",
          spotify_streams: scrapeResult.spotify?.["Spotify streams"] || "-",
          spotify_diff: scrapeResult.spotify?.["Streams difference since last check"] || "-",
          spotify_daily_avg: scrapeResult.spotify?.["Daily average (today)"] || "-",
          spotify_weekly_avg: scrapeResult.spotify?.["Weekly average (last 7 days)"] || "-",

          shazam_title: scrapeResult.shazam?.["Shazam title"] || "-",
          shazam_count: scrapeResult.shazam?.["Shazam count"] || "-",
          shazam_diff: scrapeResult.shazam?.["Difference since last check"] || "-",
          shazam_daily_avg: scrapeResult.shazam?.["Daily average (today)"] || "-",
          shazam_weekly_avg: scrapeResult.shazam?.["Weekly average (last 7 days)"] || "-",

          youtube_title: scrapeResult.youtube?.["Youtube title"] || "-",
          youtube_views: scrapeResult.youtube?.["Youtube views"] || "-",
          youtube_diff: scrapeResult.youtube?.["Difference since last check"] || "-",
          youtube_daily_avg: scrapeResult.youtube?.["Daily average (today)"] || "-",
          youtube_weekly_avg: scrapeResult.youtube?.["Weekly average (last 7 days)"] || "-",

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

  type ChartSectionProps = {
    title: string;
    data: Array<Record<string, any>>;
    dataKey: string;
  };

  const ChartSection: React.FC<ChartSectionProps> = ({ title, data, dataKey }) => (
      <div className="mt-4">
        <h4 className="font-semibold mb-2">{title}</h4>
        <div className="bg-neutral-800 p-3 rounded-lg">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#555" />
              <XAxis dataKey="timestamp" tick={{ fill: "#ccc", fontSize: 10 }} />
              <YAxis tick={{ fill: "#ccc" }} />
              <Tooltip contentStyle={{ backgroundColor: "#333", border: "none" }} />
              <Line type="monotone" dataKey={dataKey} stroke="#00E4B3" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
  );


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

                <div className="flex justify-end">
                  <Button 
                    type="button" 
                    onClick={() => setShowDiacritics(!showDiacritics)}
                    variant={showDiacritics ? "default" : "outline"}
                    size="sm" 
                    className="mt-1 text-xs"
                  >
                    {showDiacritics ? "✓ " : ""}Titlul conține diacritice pe anumite platforme?
                  </Button>
                </div>

                {showDiacritics && (
                  <FormField
                    control={form.control}
                    name="song_name_diacritics"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-sm font-medium text-neutral-300">Song Name (cu diacritice)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Introdu titlul cu diacritice (ex: Așa)" 
                            className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-accent focus:ring-accent/30" 
                            required={showDiacritics}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

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
                        Views: {scrapeResult.youtube["Youtube views"]}<br />
                        Difference since last check: {scrapeResult.youtube["Difference since last check"]}<br />
                        Daily average (today): {scrapeResult.youtube["Daily average (today)"]}<br />
                        Weekly average (last 7 days): {scrapeResult.youtube["Weekly average (last 7 days)"]}
                        {scrapeResult.youtube["Chart data"] && (
                            <ChartSection title="YouTube Views Over Time" data={scrapeResult.youtube["Chart data"]} dataKey="views" />
                        )}
                      </div>
                  )}
                  {scrapeResult.spotify && (
                      <div>
                        <strong>Spotify</strong><br />
                        Title: {scrapeResult.spotify["Spotify title"]}<br />
                        Streams: {scrapeResult.spotify["Spotify streams"]}<br />
                        Difference since last check: {scrapeResult.spotify["Streams difference since last check"]}<br />
                        Daily average (today): {scrapeResult.spotify["Daily average (today)"]}<br />
                        Weekly average (last 7 days): {scrapeResult.spotify["Weekly average (last 7 days)"]}
                        {scrapeResult.spotify["Chart data"] && (
                            <ChartSection title="Spotify Streams Over Time" data={scrapeResult.spotify["Chart data"]} dataKey="streams" />
                        )}
                      </div>
                  )}
                  {scrapeResult.shazam && (
                      <div>
                        <strong>Shazam</strong><br />
                        Title: {scrapeResult.shazam["Shazam title"]}<br />
                        Count: {scrapeResult.shazam["Shazam count"]}<br />
                        Difference since last check: {scrapeResult.shazam["Difference since last check"]}<br />
                        Daily average (today): {scrapeResult.shazam["Daily average (today)"]}<br />
                        Weekly average (last 7 days): {scrapeResult.shazam["Weekly average (last 7 days)"]}
                        {scrapeResult.shazam["Chart data"] && (
                            <ChartSection title="Shazam Counts Over Time" data={scrapeResult.shazam["Chart data"]} dataKey="shazamCount" />
                        )}
                      </div>
                  )}
                  {scrapeResult.chartex && (
                      <div>
                        <strong>Chartex</strong>
                        <p className="mt-2">Stats: {scrapeResult.chartex.chartexStats}</p>
                        
                        {scrapeResult.chartex.totalTikTokVideos && (
                          <div className="mt-2 p-3 bg-neutral-800 rounded-lg">
                            <h4 className="font-semibold mb-2">TikTok Lifetime Statistics</h4>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="p-2 bg-neutral-700 rounded">
                                <span className="block text-xs text-neutral-400">Total Videos</span>
                                <span className="text-lg font-medium">{scrapeResult.chartex.totalTikTokVideos}</span>
                              </div>
                              <div className="p-2 bg-neutral-700 rounded">
                                <span className="block text-xs text-neutral-400">Total Views</span>
                                <span className="text-lg font-medium">{scrapeResult.chartex.totalTikTokViews}</span>
                              </div>
                              <div className="p-2 bg-neutral-700 rounded">
                                <span className="block text-xs text-neutral-400">Total Likes</span>
                                <span className="text-lg font-medium">{scrapeResult.chartex.totalTikTokLikes}</span>
                              </div>
                              <div className="p-2 bg-neutral-700 rounded">
                                <span className="block text-xs text-neutral-400">Total Comments</span>
                                <span className="text-lg font-medium">{scrapeResult.chartex.totalTikTokComments}</span>
                              </div>
                              <div className="p-2 bg-neutral-700 rounded col-span-2">
                                <span className="block text-xs text-neutral-400">Total Shares</span>
                                <span className="text-lg font-medium">{scrapeResult.chartex.totalTikTokShares}</span>
                              </div>
                            </div>
                          </div>
                        )}
                        
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





