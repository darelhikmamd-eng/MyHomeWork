"use client";

import { useEffect, useState } from "react";
import { Shield, Users, Rabbit, Euro, Heart, Wheat, Loader2, Trash2, Crown, User, ChevronUp, ChevronDown } from "lucide-react";

interface UserStats {
  id: string;
  username: string;
  email: string | null;
  role: string;
  createdAt: string;
  _count: {
    rabbits: number;
    transactions: number;
    accouplements: number;
    aliments: number;
  };
}

export default function AdminPage() {
  const [users, setUsers] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  async function fetchUsers() {
    const res = await fetch("/api/admin/users");
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  }

  useEffect(() => { fetchUsers(); }, []);

  async function toggleRole(user: UserStats) {
    setActionId(user.id);
    const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";
    await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    await fetchUsers();
    setActionId(null);
  }

  async function deleteUser(user: UserStats) {
    if (!confirm(`Supprimer l'utilisateur "${user.username}" ? Cette action est irréversible.`)) return;
    setActionId(user.id);
    await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
    await fetchUsers();
    setActionId(null);
  }

  const totalRabbits = users.reduce((s, u) => s + u._count.rabbits, 0);
  const totalAccs = users.reduce((s, u) => s + u._count.accouplements, 0);
  const totalTx = users.reduce((s, u) => s + u._count.transactions, 0);
  const admins = users.filter((u) => u.role === "ADMIN").length;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-11 h-11 bg-amber-100 rounded-xl flex items-center justify-center">
          <Shield className="h-6 w-6 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-forest-900">Panneau Administrateur</h1>
          <p className="text-sm text-muted-foreground">Vue globale sur tous les utilisateurs et leurs données</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Utilisateurs", value: users.length, sub: `${admins} admin`, icon: Users, color: "text-forest-600 bg-forest-50" },
          { label: "Lapins total", value: totalRabbits, sub: "tous éleveurs", icon: Rabbit, color: "text-sage-600 bg-sage-50" },
          { label: "Accouplements", value: totalAccs, sub: "toutes fermes", icon: Heart, color: "text-rose-600 bg-rose-50" },
          { label: "Transactions", value: totalTx, sub: "toutes fermes", icon: Euro, color: "text-amber-600 bg-amber-50" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl border border-earth-100 p-5 shadow-sm">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${kpi.color}`}>
              <kpi.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-forest-900">{kpi.value}</p>
            <p className="text-sm font-medium text-forest-700">{kpi.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Users table */}
      <div className="bg-white rounded-2xl border border-earth-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-earth-100 flex items-center gap-2">
          <Users className="h-5 w-5 text-forest-600" />
          <h2 className="font-semibold text-forest-900">Liste des utilisateurs</h2>
          <span className="ml-auto text-sm text-muted-foreground">{users.length} compte{users.length > 1 ? "s" : ""}</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-forest-500" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">Aucun utilisateur</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cream-50 border-b border-earth-100">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Utilisateur</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rôle</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Lapins</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Accoupl.</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stocks</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Transactions</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Inscrit le</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-earth-50">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-cream-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${user.role === "ADMIN" ? "bg-amber-100" : "bg-forest-100"}`}>
                          {user.role === "ADMIN"
                            ? <Crown className="h-4 w-4 text-amber-600" />
                            : <User className="h-4 w-4 text-forest-600" />
                          }
                        </div>
                        <div>
                          <p className="font-semibold text-forest-900">{user.username}</p>
                          <p className="text-xs text-muted-foreground">{user.email ?? "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        user.role === "ADMIN"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-forest-100 text-forest-700"
                      }`}>
                        {user.role === "ADMIN" ? <Crown className="h-3 w-3" /> : <User className="h-3 w-3" />}
                        {user.role === "ADMIN" ? "Admin" : "Éleveur"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center gap-1 text-forest-700 font-medium">
                        <Rabbit className="h-3.5 w-3.5" />
                        {user._count.rabbits}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center gap-1 text-rose-600 font-medium">
                        <Heart className="h-3.5 w-3.5" />
                        {user._count.accouplements}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center gap-1 text-sage-600 font-medium">
                        <Wheat className="h-3.5 w-3.5" />
                        {user._count.aliments}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
                        <Euro className="h-3.5 w-3.5" />
                        {user._count.transactions}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center text-muted-foreground text-xs">
                      {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => toggleRole(user)}
                          disabled={actionId === user.id}
                          title={user.role === "ADMIN" ? "Rétrograder en Éleveur" : "Promouvoir en Admin"}
                          className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                            user.role === "ADMIN"
                              ? "text-amber-600 hover:bg-amber-50"
                              : "text-forest-600 hover:bg-forest-50"
                          }`}
                        >
                          {actionId === user.id
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : user.role === "ADMIN" ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />
                          }
                        </button>
                        <button
                          onClick={() => deleteUser(user)}
                          disabled={actionId === user.id}
                          title="Supprimer l'utilisateur"
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center mt-6">
        ↑ Promouvoir en Admin &nbsp;|&nbsp; ↓ Rétrograder en Éleveur &nbsp;|&nbsp; 🗑 Supprimer le compte et toutes ses données
      </p>
    </div>
  );
}
