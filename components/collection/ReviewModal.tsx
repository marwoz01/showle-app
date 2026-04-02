import { View, Text, Pressable, TextInput, Modal } from "react-native";
import { useState, useEffect } from "react";
import { useTranslation } from "@/i18n";

const MAX_CHARS = 1000;

interface ReviewModalProps {
  visible: boolean;
  initialReview: string;
  movieTitle: string;
  onSave: (review: string) => void;
  onClose: () => void;
}

export default function ReviewModal({
  visible,
  initialReview,
  movieTitle,
  onSave,
  onClose,
}: ReviewModalProps) {
  const { t } = useTranslation();
  const [text, setText] = useState(initialReview);

  useEffect(() => {
    if (visible) setText(initialReview);
  }, [visible, initialReview]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 justify-end bg-black/60"
        onPress={onClose}
      >
        <Pressable
          className="rounded-t-3xl border-t border-border bg-card px-5 pb-10 pt-5"
          onPress={() => {}}
        >
          <View className="mb-1 h-1 w-10 self-center rounded-full bg-border" />

          <Text className="mt-3 text-lg font-heading-bold text-primary">
            {t.collections.review}
          </Text>
          <Text
            className="mb-4 text-sm font-sans-medium text-muted-foreground"
            numberOfLines={1}
          >
            {movieTitle}
          </Text>

          <TextInput
            value={text}
            onChangeText={(v) => setText(v.slice(0, MAX_CHARS))}
            placeholder={t.collections.writeReview}
            placeholderTextColor="#555"
            multiline
            textAlignVertical="top"
            className="rounded-xl border border-border bg-background p-3 text-sm font-sans text-primary"
            style={{ minHeight: 120, maxHeight: 240 }}
            autoFocus
          />

          <Text className="mt-1 text-right text-xs font-sans text-muted-foreground">
            {text.length}/{MAX_CHARS} {t.collections.characters}
          </Text>

          <View className="mt-4 flex-row gap-3">
            <Pressable
              onPress={onClose}
              className="flex-1 items-center rounded-xl border border-border py-3"
            >
              <Text className="text-sm font-heading-semibold text-muted-foreground">
                {t.collections.cancel}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => onSave(text)}
              className="flex-1 items-center rounded-xl py-3"
              style={{ backgroundColor: "#7c4dff" }}
            >
              <Text className="text-sm font-heading-semibold text-white">
                {t.collections.save}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
