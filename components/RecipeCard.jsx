import { useState, useEffect, Suspense } from "react";
import { View, Text, TouchableOpacity, Image, Alert, ActivityIndicator } from "react-native";
import { toggleFavorite, isFavorite, deletePost } from "../lib/appwrite";

import { icons } from "../constants";
import useStore from "../lib/store";
import { router } from "expo-router";
import { useGlobalContext } from "../context/GlobalProvider";

const RecipeCard = ({
  description,
  onProfile,
  title,
  creator,
  avatar,
  thumbnail,
  userId,
  postId,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);  // Stan do śledzenia, czy obraz został załadowany
  const { user } = useGlobalContext(); // uzyskaj dane zalogowanego użytkownika
  const favorites = useStore((state) => state.favorites);
  const addFavorite = useStore((state) => state.addFavorite);
  const removeFavorite = useStore((state) => state.removeFavorite);

  const userData = user?.$id;

  useEffect(() => {
    const checkFavorite = async () => {
      if (!user) return;
      const favId = await isFavorite({ userId: userData, postId }); // użyj userId zalogowanego użytkownika
      if (favId) {
        addFavorite(userData, postId);
      } else {
        removeFavorite(userData, postId);
      }
    };
    checkFavorite();
  }, [userData, postId, addFavorite, removeFavorite]); // dodaj user.$id do dependencies

  const handleEdit = () => {
    router.push(`/edit/${postId}`);
    console.log(creator, title, avatar, thumbnail, userId, postId);
  };

  const handleDelete = async () => {
    console.log("Delete post with ID:", postId);
    await deletePost(postId);
    Alert.alert("Post deleted successfully");
  };

  const Loader = () => (
    <View className="flex justify-center items-center w-full h-60">
      <Text>Loading...</Text>
    </View>
  );

  const handlePress = async () => {
    const favId = await isFavorite({ userId: userData, postId }); // użyj userId zalogowanego użytkownika
    if (favId === null) {
      return;
    }
    const newFavStatus = await toggleFavorite({
      userId: userData,
      postId,
      favId,
    }); // użyj userId zalogowanego użytkownika
    if (newFavStatus) {
      addFavorite(userData, postId);
    } else {
      removeFavorite(userData, postId);
    }
  };

  const heart = !!favorites[`${userData}-${postId}`]; // użyj userId zalogowanego użytkownika
  return (
    <View className="flex flex-col items-center px-4 mb-14">
      <View className="flex flex-row gap-3 items-center">
        <View className="flex justify-center items-center flex-row flex-1">
          <View className="w-[46px] h-[46px] rounded-lg border border-secondary flex justify-center items-center p-0.5">
            <Image
              source={{ uri: avatar }}
              className="w-full h-full rounded-lg"
              resizeMode="cover"
            />
          </View>

          <View className="flex justify-center flex-1 ml-3 gap-y-1">
            <Text
              className="font-semibold text-sm text-black"
              numberOfLines={2}
            >
              {title}
            </Text>
            <Text className="text-xs text-black font-normal" numberOfLines={2}>
              {creator}
            </Text>
          </View>
        </View>

        {onProfile ? ( // sprawdź, czy zalogowany użytkownik jest twórcą postu
          <View className="flex flex-row gap-x-4">
            <TouchableOpacity activeOpacity={0.7} onPress={handleEdit}>
              <Image
                source={icons.editIcon}
                className="w-8 h-8 bg-white/10 rounded-xl"
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.7} onPress={handleDelete}>
              <Image
                source={icons.deleteIcon}
                className="w-8 h-8 bg-white/10 rounded-xl"
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        ) : (
          <View className="relative flex flex-row-reverse justify-center items-center gap-4">
            <TouchableOpacity activeOpacity={0.7} onPress={handlePress}>
              <Image
                source={heart ? icons.heart : icons.blackHeart}
                className="w-8 h-8 bg-white/10 rounded-xl"
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
      <TouchableOpacity
        activeOpacity={0.7}
        className="w-full h-60 rounded-xl mt-3 relative flex justify-center items-center"
        onPress={() => router.push(`/info/${postId}`)}
      >
        <Image
          source={{ uri: thumbnail }}
          className="w-full h-full rounded-xl"
          resizeMode="cover"
          onLoad={() => setIsLoaded(true)}
        />
        {!isLoaded && (
          <View
            style={{
              position: "absolute",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              height: "100%",
            }}
          >
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};
export default RecipeCard;
