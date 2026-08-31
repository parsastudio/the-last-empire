"use client";

import React, { useState, useMemo } from "react";
import { ShoppingCart, ShieldCheck, Search } from "lucide-react";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { MachinerySellerCard } from "./components/machinery-seller-card";
import { MachineryImportCountryView } from "./components/machinery-import-country-view";

interface IndustryImportTabProps {
  nation: Nation;
  nationsMap?: Record<string, Nation>;
  provincesMap?: Record<string, Province>;
}

export function IndustryImportTab({
  nation,
  nationsMap,
  provincesMap,
}: IndustryImportTabProps) {
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const totalFactories = useMemo(() => {
    if (!provincesMap) return 10;
    const count = Object.values(provincesMap)
      .filter((p) => p.ownerNationId === nation.id)
      .reduce((sum, p) => sum + p.factoriesCount, 0);
    return Math.max(1, count);
  }, [provincesMap, nation.id]);

  const minBatchTech = useMemo(() => {
    if (!nation.factoryTiers || nation.factoryTiers.length === 0) {
      return nation.equipmentTechLevel;
    }
    return Math.min(...nation.factoryTiers.map((b) => b.techLevel));
  }, [nation.factoryTiers, nation.equipmentTechLevel]);

  const sellers = useMemo(() => {
    if (!nationsMap) return [];
    return Object.values(nationsMap)
      .filter(
        (n) =>
          n.isAlive && n.id !== nation.id && n.industrialLevel > minBatchTech,
      )
      .sort((a, b) => b.industrialLevel - a.industrialLevel);
  }, [nationsMap, nation.id, minBatchTech]);

  const filteredSellers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return sellers;
    return sellers.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.flagCode.toLowerCase().includes(q),
    );
  }, [sellers, searchQuery]);

  const selectedSeller = useMemo(() => {
    if (!selectedSellerId || !nationsMap) return null;
    const canonical = CountryRegistry.resolveCanonicalId(selectedSellerId);
    return nationsMap[canonical] || nationsMap[selectedSellerId] || null;
  }, [selectedSellerId, nationsMap]);

  if (selectedSeller) {
    return (
      <MachineryImportCountryView
        buyerNation={nation}
        sellerNation={selectedSeller}
        totalFactories={totalFactories}
        onBack={() => setSelectedSellerId(null)}
      />
    );
  }

  return (
    <div className="space-y-4 dir-rtl text-right font-sans animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-secondary/30 border border-border/60 rounded-2xl">
        <div className="flex items-center gap-2">
          <ShoppingCart size={16} className="text-primary" />
          <div>
            <h3 className="text-xs font-black text-foreground">
              فهرست صادرکنندگان تجهیزات و ماشین‌آلات پیشرفته
            </h3>
            <span className="text-[10px] text-muted-foreground">
              روی هر کشور کلیک کنید تا میز واردات خطوط تولید و تجهیز رده‌ها با
              لول آن کشور باز شود.
            </span>
          </div>
        </div>

        <div className="relative min-w-[220px]">
          <Search
            size={13}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="جستجوی نام یا نماد صادرکننده..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-secondary/70 border border-border/70 rounded-xl py-1.5 pr-8 pl-3 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary text-right"
          />
        </div>
      </div>

      {sellers.length === 0 ? (
        <div className="p-12 bg-card/60 border border-border/60 rounded-3xl text-center space-y-2">
          <ShieldCheck size={32} className="text-emerald-400 mx-auto" />
          <span className="text-sm font-black text-foreground block">
            پیشرفته‌ترین صنایع در اختیار شماست
          </span>
          <p className="text-xs text-muted-foreground">
            هیچ کشوری در جهان فناوری صنعتی بالاتری نسبت به خطوط تولید فعلی شما
            ندارد.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredSellers.map((seller) => (
            <MachinerySellerCard
              key={seller.id}
              seller={seller}
              isSelected={false}
              onSelect={setSelectedSellerId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
