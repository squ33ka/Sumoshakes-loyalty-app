import { useEffect, useState } from "react";
import { Card, CardContent } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://bvfcmtgtcliwbmpdnryt.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ2ZmNtdGd0Y2xpd2JtcGRucnl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MTU0MjUsImV4cCI6MjA2NTk5MTQyNX0.amQ9oFrS-aGqTKMO-06-XiSsCNAlAzYnuQsU-FmL4S0";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function SumoShakesLoyaltyApp() {
  const [customer, setCustomer] = useState(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchOrCreateCustomer = async (customerName) => {
    setLoading(true);
    let { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("name", customerName)
      .single();

    if (!data && !error) {
      const { data: newCustomer } = await supabase
        .from("customers")
        .insert([{ name: customerName, coffee: 0, shake: 0, donut: 0 }])
        .select()
        .single();
      data = newCustomer;
    }

    setCustomer(data);
    setLoading(false);
  };

  const handlePurchase = async (type) => {
    const updated = { ...customer, [type]: customer[type] + 1 };
    const { data } = await supabase
      .from("customers")
      .update({ [type]: updated[type] })
      .eq("id", customer.id)
      .select()
      .single();
    setCustomer(data);
  };

  const getReward = async (type) => {
    let threshold = 0;
    let message = "";
    if (type === "coffee") {
      threshold = 5;
      message = "You've earned a FREE coffee!";
    } else if (type === "shake") {
      threshold = 5;
      message = "You've earned a FREE milkshake!";
    } else if (type === "donut") {
      threshold = 12;
      message = "You've earned 3 FREE cinnamon donuts!";
    }
    if (customer[type] >= threshold) {
      const newCount = customer[type] - threshold;
      const { data } = await supabase
        .from("customers")
        .update({ [type]: newCount })
        .eq("id", customer.id)
        .select()
        .single();
      setCustomer(data);
      alert(message);
    }
  };

  if (!customer) {
    return (
      <div className="p-6 max-w-md mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-center">Sumo Shakes Loyalty</h1>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="w-full p-2 border rounded"
        />
        <button onClick={() => fetchOrCreateCustomer(name)} disabled={!name || loading}>
          {loading ? "Loading..." : "Access My Loyalty"}
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4 max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-center">Welcome, {customer.name}!</h1>
      <p className="text-center text-sm">102 Kendal Street, Cowra NSW</p>

      <Card>
        <CardContent className="p-4 space-y-2">
          <h2 className="text-xl font-semibold">Large Coffee Purchases: {customer.coffee}</h2>
          <button onClick={() => handlePurchase("coffee")}>Add Coffee</button>
          <button onClick={() => getReward("coffee")} disabled={customer.coffee < 5}>
            Claim Free Coffee
          </button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-2">
          <h2 className="text-xl font-semibold">Large Milkshake Purchases: {customer.shake}</h2>
          <button onClick={() => handlePurchase("shake")}>Add Milkshake</button>
          <button onClick={() => getReward("shake")} disabled={customer.shake < 5}>
            Claim Free Milkshake
          </button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-2">
          <h2 className="text-xl font-semibold">Iced Donut Purchases: {customer.donut}</h2>
          <button onClick={() => handlePurchase("donut")}>Add Donut</button>
          <button onClick={() => getReward("donut")} disabled={customer.donut < 12}>
            Claim 3 Free Cinnamon Donuts
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
