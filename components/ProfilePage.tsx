
import React from 'react';
import { UserProfile } from '../types';
import Button from './Button';
import Spinner from './Spinner';

interface ProfilePageProps {
  userProfile: UserProfile;
  updateUserProfile: (updatedProfile: Partial<UserProfile>) => void;
}

const defaultAvatar = 'https://i.pravatar.cc/150?img=68'; // Default avatar if none selected

const ProfilePage: React.FC<ProfilePageProps> = ({ userProfile, updateUserProfile }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedName, setEditedName] = React.useState(userProfile.name);
  const [editedBio, setEditedBio] = React.useState(userProfile.bio);
  const [editedAvatarFile, setEditedAvatarFile] = React.useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = React.useState<string | null>(userProfile.avatarUrl);
  const [isFollowed, setIsFollowed] = React.useState(() => {
    // Check if "followed" state is in localStorage for this user
    const storedFollowedState = localStorage.getItem(`socialvid_followed_${userProfile.id}`);
    return storedFollowedState === 'true';
  });

  // Effect to update local editing states when userProfile changes from parent
  React.useEffect(() => {
    setEditedName(userProfile.name);
    setEditedBio(userProfile.bio);
    setAvatarPreviewUrl(userProfile.avatarUrl);
    setIsFollowed(localStorage.getItem(`socialvid_followed_${userProfile.id}`) === 'true');
  }, [userProfile]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setEditedAvatarFile(file);
      const url = URL.createObjectURL(file);
      setAvatarPreviewUrl(url);
    } else {
      setEditedAvatarFile(null);
      setAvatarPreviewUrl(userProfile.avatarUrl); // Revert to current avatar if invalid file
      alert('Por favor, selecione um arquivo de imagem válido.');
    }
  };

  const handleSave = async () => {
    let newAvatarUrl = avatarPreviewUrl;

    if (editedAvatarFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        newAvatarUrl = reader.result as string;
        updateUserProfile({
          name: editedName.trim(),
          bio: editedBio.trim(),
          avatarUrl: newAvatarUrl,
        });
        setIsEditing(false);
        setEditedAvatarFile(null); // Clear file after saving
      };
      reader.readAsDataURL(editedAvatarFile);
    } else {
      updateUserProfile({
        name: editedName.trim(),
        bio: editedBio.trim(),
        avatarUrl: newAvatarUrl || defaultAvatar,
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedName(userProfile.name);
    setEditedBio(userProfile.bio);
    setEditedAvatarFile(null);
    setAvatarPreviewUrl(userProfile.avatarUrl);
  };

  const handleFollowClick = () => {
    if (!isFollowed) {
      updateUserProfile({ followers: userProfile.followers + 1 });
      setIsFollowed(true);
      localStorage.setItem(`socialvid_followed_${userProfile.id}`, 'true'); // Persist followed state
    }
  };

  return (
    <div className="min-h-[calc(100vh-theme(spacing.16))] bg-gray-900 text-white flex flex-col items-center p-4 pt-10">
      <div className="relative bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl my-auto">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-400">Perfil do Usuário</h2>

        {/* Profile Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-blue-400 mb-4">
            <img
              src={avatarPreviewUrl || defaultAvatar}
              alt="User Avatar"
              className="w-full h-full object-cover"
            />
            {isEditing && (
              <label htmlFor="avatar-upload" className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white cursor-pointer text-sm font-semibold">
                <svg className="w-6 h-6 mr-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 12a8 8 0 1116 0A8 8 0 014 12zm8-6a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0112 6zm0 10a.75.75 0 01.75.75v.5a.75.75 0 01-1.5 0v-.5A.75.75 0 0112 16z"></path>
                  <path fillRule="evenodd" d="M10 2a2 2 0 00-2 2v1H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V7a2 2 0 00-2-2h-4V4a2 2 0 00-2-2h-4zm2 2a.75.75 0 01.75.75V5h3.5a.75.75 0 01.75.75V7h-16V5.75A.75.75 0 014.75 5h3.5v-.25a.75.75 0 01.75-.75h4zM4 9.5a.75.75 0 01.75-.75h14.5a.75.75 0 01.75.75v7.5a.75.75 0 01-.75.75H4.75a.75.75 0 01-.75-.75v-7.5z" clipRule="evenodd"></path>
                </svg>
                Mudar Foto
              </label>
            )}
          </div>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
            aria-label="Upload new avatar image"
            disabled={!isEditing}
          />
          {!isEditing ? (
            <h3 className="text-2xl font-semibold mb-2">{userProfile.name}</h3>
          ) : (
            <input
              type="text"
              className="text-center text-2xl font-semibold mb-2 bg-gray-700 text-white rounded-md p-1 w-full max-w-xs"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              aria-label="Edit profile name"
            />
          )}

          <p className="text-gray-400 text-sm mb-4">@{userProfile.name.toLowerCase().replace(/\s/g, '_')}</p>

          <div className="flex space-x-6 text-lg mb-6">
            <div>
              <span className="font-bold text-blue-300">{userProfile.followers}</span>
              <span className="text-gray-400 ml-1">Seguidores</span>
            </div>
          </div>

          {!isEditing ? (
            <p className="text-gray-300 text-center max-w-md mb-6 whitespace-pre-wrap">{userProfile.bio || "Nenhuma biografia adicionada."}</p>
          ) : (
            <textarea
              className="text-center text-gray-300 bg-gray-700 text-white rounded-md p-2 w-full max-w-md min-h-[100px] resize-y"
              value={editedBio}
              onChange={(e) => setEditedBio(e.target.value)}
              placeholder="Escreva sua biografia aqui..."
              aria-label="Edit profile biography"
            />
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-8 pt-6 border-t border-gray-700">
          {!isEditing ? (
            <>
              <Button onClick={() => setIsEditing(true)} variant="primary" aria-label="Edit your profile">
                Editar Perfil
              </Button>
              <Button
                onClick={handleFollowClick}
                disabled={isFollowed}
                variant={isFollowed ? 'secondary' : 'primary'}
                aria-label={isFollowed ? 'Você está seguindo este perfil' : 'Seguir este perfil'}
              >
                {isFollowed ? 'Seguindo' : 'Seguir'}
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleCancel} variant="secondary" aria-label="Cancel profile edits">
                Cancelar
              </Button>
              <Button onClick={handleSave} variant="primary" aria-label="Save profile changes">
                Salvar
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
