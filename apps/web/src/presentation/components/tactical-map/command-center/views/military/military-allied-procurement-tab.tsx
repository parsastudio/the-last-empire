import React, { useState, useMemo } from "react";
import { Users, Search, ShoppingCart } from "lucide-react";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { NationGettersUtility, getNationGdp } from "@geopolitics/domain";
import {
  AlliedSellerCard,
  AlliedSellerItem,
} from "@/presentation/components/tactical-map/command-center/views/military/components/allied-seller-card";
import { AlliedUnitBuyGrid } from "@/presentation/components/tactical-map/command-center/views/military/components/allied-unit-buy-grid";

interface MilitaryAlliedProcurementTabProps {
  nation: Nation;
  nationsMap?: Record<string, Nation>;
  provincesMap?: Record<string, Province>;
  selectedTargetCode?: string | null;
}

export function MilitaryAlliedProcurementTab({
  nation,
  nationsMap,
  provincesMap,
  selectedTargetCode,
}: MilitaryAlliedProcurementTabProps) {
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(
    selectedTargetCode
      ? CountryRegistry.resolveCanonicalId(selectedTargetCode)
      : null,
  );
  const [searchQuery, setSearchQuery] = useState<string>("");

  const buyerGdp = useMemo(
    () => getNationGdp(nation, provincesMap),
    [nation, provincesMap],
  );

  const sellerOptions = useMemo<AlliedSellerItem[]>(() => {
    if (!nationsMap) return [];
    const rankLookup = NationGettersUtility.calculateRankMap(
      nationsMap,
      provincesMap,
    );

    return Object.values(nationsMap)
      .filter((n) => {
        if (n.id === nation.id || !n.isAlive) return false;
        const canonical = CountryRegistry.resolveCanonicalId(n.id);
        const rel = nation.relations[canonical] || nation.relations[n.id];
        const stance = rel ? rel.stance : "NORMAL_DIPLOMACY";
        const tension = rel ? (rel.tension ?? 10) : 10;
        return (
          stance !== "WAR" &&
          tension < 50 &&
          n.military.techLevel > nation.military.techLevel
        );
      })
      .map((n) => {
        const canonical = CountryRegistry.resolveCanonicalId(n.id);
        const rel = nation.relations[canonical] || nation.relations[n.id];
        const tension = rel ? (rel.tension ?? 10) : 10;
        const rank = rankLookup.get(canonical) ?? 99;

        return {
          id: canonical,
          name: n.name,
          flagCode: n.flagCode || "IR",
          techLevel: n.military.techLevel,
          tension,
          rank,
        };
      })
      .sort((a, b) => {
        if (b.techLevel !== a.techLevel) return b.techLevel - a.techLevel;
        return a.rank - b.rank;
      });
  }, [
    nationsMap,
    provincesMap,
    nation.id,
    nation.relations,
    nation.military.techLevel,
  ]);

  const filteredSellers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return sellerOptions;
    return sellerOptions.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.flagCode.toLowerCase().includes(q),
    );
  }, [sellerOptions, searchQuery]);

  const selectedSellerNation = useMemo(() => {
    if (!selectedSellerId || !nationsMap) return null;
    const canonical = CountryRegistry.resolveCanonicalId(selectedSellerId);
    return nationsMap[canonical] || nationsMap[selectedSellerId] || null;
  }, [selectedSellerId, nationsMap]);

  if (selectedSellerNation) {
    return (
      <AlliedUnitBuyGrid
        buyerNation={nation}
        sellerNation={selectedSellerNation}
        provincesMap={provincesMap}
        currentGdp={buyerGdp}
        onBack={() => setSelectedSellerId(null)}
      />
    );
  }

  if (sellerOptions.length === 0) {
    return (
      <div className="p-12 bg-secondary/30 border border-border/60 rounded-3xl space-y-3 text-center dir-rtl animate-fade-smooth">
        <Users size={36} className="text-muted-foreground mx-auto" />
        <h3 className="text-sm font-black text-foreground">
          هیچ کشوری با فناوری نظامی بالاتر در دسترس نیست
        </h3>
        <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed font-sans">
          برای واردات تسلیحات، کشور صادرکننده باید سطح فناوری دفاعی بالاتری نسبت
          به شما داشته باشد، در وضعیت جنگ نباشد و تنش امنیتی زیر ۵۰٪ باشد.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans dir-rtl text-right animate-fade-smooth">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-secondary/30 border border-border/60 rounded-2xl">
        <div className="flex items-center gap-2">
          <ShoppingCart size={16} className="text-amber-500" />
          <div>
            <h3 className="text-xs font-black text-foreground">
              فهرست کشورهای هم‌پیمان با فناوری پیشرفته‌تر
            </h3>
            <span className="text-[10px] text-muted-foreground">
              روی هر کشور کلیک کنید تا زرادخانه آن باز شود (قیمت‌گذاری بر اساس
              اختلاف سطح فناوری محاسبه می‌گردد).
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredSellers.map((seller) => (
          <AlliedSellerCard
            key={seller.id}
            seller={seller}
            onSelect={setSelectedSellerId}
          />
        ))}
      </div>
    </div>
  );
}
