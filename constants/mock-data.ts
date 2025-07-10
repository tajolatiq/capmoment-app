// constants/mock-data.ts
export type StoryType = {
  id: string;
  username: string;
  avatar: string | number;
  hasStory: boolean;
};

export const STORIES: StoryType[] = [
  {
    id: "1",
    username: "Tajol",
    avatar: require("../assets/images/Tajol.jpg"),
    hasStory: false,
  },
  {
    id: "2",
    username: "Amad",
    avatar:require("../assets/images/Amad.jpeg"),
    hasStory: true,
  },
  {
    id: "3",
    username: "Anur",
    avatar:require("../assets/images/Anur.jpeg"),
    hasStory: true,
  },
  {
    id: "4",
    username: "Azwar",
    avatar:require("../assets/images/Azwar.png"),
    hasStory: true,
  },
  {
    id: "5",
    username: "Story",
    avatar:require("../assets/images/splash-icon.png"),
    hasStory: true,
  },
  {
    id: "6",
    username: "Feature",
    avatar:require("../assets/images/splash-icon.png"),
    hasStory: true,
  },
  {
    id: "7",
    username: "Coming",
    avatar:require("../assets/images/splash-icon.png"),
    hasStory: true,
  },
  {
    id: "8",
    username: "Soon",
    avatar:require("../assets/images/splash-icon.png"),
    hasStory: true,
  },
];
