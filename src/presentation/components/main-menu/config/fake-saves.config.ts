export interface FakeSave {
  id: string;
  title: string;
  date: string;
  playtime: string;
  turn: number;
}

export const FAKE_SAVES: FakeSave[] = [
  {
    id: "save-1",
    title: "بازی ذخیره‌شده ۱ - حاکمیت ایران (IRN)",
    date: "۶ مرداد ۱۴۰۵ - ۱۵:۴۲",
    playtime: "۶ ساعت و ۱۲ دقیقه",
    turn: 42,
  },
  {
    id: "save-2",
    title: "بازی ذخیره‌شده ۲ - حاکمیت ایالات متحده (USA)",
    date: "۴ مرداد ۱۴۰۵ - ۱۱:۲۰",
    playtime: "۳ ساعت و ۴۵ دقیقه",
    turn: 19,
  },
  {
    id: "save-3",
    title: "بازی ذخیره‌شده ۳ - حاکمیت آلمان (DEU)",
    date: "۲۸ تیر ۱۴۰۵ - ۲۲:۰۵",
    playtime: "۱۲ ساعت و ۳۰ دقیقه",
    turn: 89,
  },
];
