import { API_URL } from "../../lib/api";
import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Award, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

export default function Leaderboard() {
  const { t, i18n } = useTranslation();
  const { token, user: currentUser } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/leaderboard`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setLeaderboard(data);
        } else {
          console.error("API returned non-array for leaderboard:", data);
          setLeaderboard([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching leaderboard", err);
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return <div className="p-8 text-center text-text-dark">{t("leaderboard.loading")}</div>;
  }

  return (
    <div dir={i18n.language === "ur" ? "rtl" : "ltr"} className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-text-dark flex items-center gap-3">
            <Trophy className="h-8 w-8 text-yellow-500" />
            {t("leaderboard.title")}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {t("leaderboard.subtitle")}
          </p>
        </div>
      </div>

      <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm text-text-dark">
            <thead className="bg-gray-50 dark:bg-gray-800/50 uppercase text-gray-500 dark:text-gray-400 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">{t("leaderboard.rank_col")}</th>
                <th className="px-6 py-4 font-medium">{t("leaderboard.learner_col")}</th>
                <th className="px-6 py-4 font-medium">{t("leaderboard.points_col")}</th>
                <th className="px-6 py-4 font-medium text-center">{t("leaderboard.badges_col")}</th>
                <th className="px-6 py-4 font-medium text-center">{t("leaderboard.certificates_col")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {leaderboard.map((user) => {
                const isCurrentUser = user.id === currentUser?.id;
                return (
                  <tr
                    key={user.id}
                    className={`${isCurrentUser ? 'bg-primary/5 dark:bg-primary/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'} transition-colors`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full font-bold">
                        {user.rank === 1 && <Medal className="h-6 w-6 text-yellow-500" />}
                        {user.rank === 2 && <Medal className="h-6 w-6 text-gray-400" />}
                        {user.rank === 3 && <Medal className="h-6 w-6 text-amber-600" />}
                        {user.rank > 3 && <span className="text-gray-500">{user.rank}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold ${isCurrentUser ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'}`}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className={`font-medium ${isCurrentUser ? 'text-primary' : 'text-text-dark'}`}>
                          {user.name} {isCurrentUser && t("leaderboard.you_suffix")}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-lg text-text-dark">
                      {user.points.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1 text-gray-600 dark:text-gray-300">
                        <Star className="h-4 w-4 text-orange-500" />
                        {user.badges}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1 text-gray-600 dark:text-gray-300">
                        <Award className="h-4 w-4 text-blue-500" />
                        {user.certificates}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {leaderboard.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    {t("leaderboard.no_data")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}