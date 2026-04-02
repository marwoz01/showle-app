import { useState } from "react";
import { View, Text, Pressable, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "@/i18n";
import { api } from "@/lib/api";

export default function NewRanking() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useTranslation();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const list = await api.rankings.create(
        name.trim(),
        description.trim() || undefined,
      );
      router.replace(`/ranking/${list.id}`);
    } catch {
      setCreating(false);
    }
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center gap-3 px-4 pb-4 pt-2">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color="#e8e8ed" />
        </Pressable>
        <Text className="text-lg font-heading-bold text-primary">
          {t.collections.newList}
        </Text>
      </View>

      <View className="px-4">
        {/* Name */}
        <Text className="mb-2 text-xs font-heading-semibold uppercase tracking-wider text-muted-foreground">
          {t.collections.listName}
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Top 10 Horror Films"
          placeholderTextColor="#555"
          className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-sans text-primary"
          autoFocus
        />

        {/* Description */}
        <Text className="mb-2 mt-5 text-xs font-heading-semibold uppercase tracking-wider text-muted-foreground">
          {t.collections.listDescription}
        </Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder=""
          placeholderTextColor="#555"
          multiline
          textAlignVertical="top"
          className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-sans text-primary"
          style={{ minHeight: 80 }}
        />

        {/* Create button */}
        <Pressable
          onPress={handleCreate}
          disabled={!name.trim() || creating}
          className="mt-6 items-center rounded-xl py-3.5"
          style={{
            backgroundColor: name.trim()
              ? "#7c4dff"
              : "rgba(124,77,255,0.3)",
          }}
        >
          <Text className="text-base font-heading-semibold text-white">
            {creating ? "..." : t.collections.createList}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
