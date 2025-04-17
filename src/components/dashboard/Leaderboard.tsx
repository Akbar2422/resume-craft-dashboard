
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

interface LeaderboardProps {
  leaderboard: Array<{user_id: string, total_points: number}>;
}

export default function Leaderboard({ leaderboard }: LeaderboardProps) {
  const { user } = useAuth();

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Legend Leaderboard</h2>
        <div className="space-y-2">
          {leaderboard.map((entry, index) => (
            <div key={entry.user_id} className="flex items-center space-x-4 py-2 border-b">
              <span className="text-sm font-medium w-8">{index + 1}.</span>
              <span className="flex-1 text-sm">
                {entry.user_id === user?.id ? 'You' : 'User'}
              </span>
              <span className="text-sm font-semibold">
                {entry.total_points} pts
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
