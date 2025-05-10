"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import CoffeeCard from "@/app/components/coffee/CoffeeCard";
import CoffeeModalWrapper from "./CoffeeModalWrapper";
import LoadingSpinner from "@/app/components/LoadingSpinner";

type Props = {
  userId: string;
};

export default function CoffeesTab({ userId }: Props) {
  const [coffees, setCoffees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCoffeeModal, setShowCoffeeModal] = useState(false);

  useEffect(() => {
    const fetchCoffees = async () => {
      try {
        setLoading(true);
        // Fetch coffees created by the user
        const response = await fetch(`/api/coffees?createdBy=${userId}`);

        if (!response.ok) {
          throw new Error("Failed to fetch coffees");
        }

        const data = await response.json();
        setCoffees(data);
      } catch (err) {
        console.error("Error fetching coffees:", err);
        setError("Failed to load coffees. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCoffees();
  }, [userId]);

  const handleCoffeeCreated = (newCoffee: any) => {
    setCoffees((prevCoffees) => [newCoffee, ...prevCoffees]);
    setShowCoffeeModal(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Your Coffees</h2>
        <button
          onClick={() => setShowCoffeeModal(true)}
          className="btn btn-primary btn-sm flex items-center gap-2"
        >
          <Plus size={16} />
          Add Coffee
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <div className="alert alert-error">
          <p>{error}</p>
        </div>
      ) : coffees.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            You haven't added any coffees yet
          </p>
          <button
            onClick={() => setShowCoffeeModal(true)}
            className="btn btn-primary"
          >
            Add Your First Coffee
          </button>
        </div>
      ) : (
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-auto"
          style={{
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 450px), 1fr))",
          }}
        >
          {coffees.map((coffee: any) => (
            <CoffeeCard
              key={coffee.id}
              coffee={coffee}
              currentUserId={userId}
              showEditButton={true}
            />
          ))}
        </div>
      )}

      {/* Coffee Creation Modal */}
      <CoffeeModalWrapper
        show={showCoffeeModal}
        onClose={() => setShowCoffeeModal(false)}
        onCoffeeCreated={handleCoffeeCreated}
      />
    </div>
  );
}
