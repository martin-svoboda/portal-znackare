import React, {useState, useRef, useCallback} from "react";
import {
	Box,
	Group,
	Text,
	Card,
	ActionIcon,
	Button,
	Stack,
	Image,
	Modal,
	Grid,
	Alert,
	Progress,
	Flex
} from "@mantine/core";
import {
	IconUpload,
	IconTrash,
	IconRotateClockwise,
	IconRotate2,
	IconEye,
	IconFile,
	IconPhoto,
	IconX,
	IconCheck
} from "@tabler/icons-react";
import {Dropzone, FileWithPath} from "@mantine/dropzone";
import {useAuth} from "../../auth/AuthContext";
import {FileAttachment} from "../types/HlaseniTypes";
import {notifications} from "@mantine/notifications";

interface FileUploadZoneProps {
	files: FileAttachment[];
	onFilesChange: (files: FileAttachment[]) => void;
	maxFiles?: number;
	maxSize?: number; // v MB
	accept?: string;
	disabled?: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
	files,
	onFilesChange,
	maxFiles = 5,
	maxSize = 10,
	accept = "image/jpeg,image/png,image/heic,application/pdf",
	disabled = false
}) => {
	const {user} = useAuth();
	const [uploading, setUploading] = useState(false);
	const [previewFile, setPreviewFile] = useState<FileAttachment | null>(null);
	const [rotationAngle, setRotationAngle] = useState(0);

	const isImage = (filename: string) => {
		return /\.(jpg|jpeg|png|gif|bmp|webp|heic)$/i.test(filename);
	};

	const isPdf = (filename: string) => {
		return /\.pdf$/i.test(filename);
	};

	const convertHeicToJpeg = async (file: File): Promise<File> => {
		// V produkčním prostředí by zde byla implementace konverze HEIC
		// Pro demo účely vrátíme původní soubor
		return file;
	};

	const compressImage = async (file: File, maxWidth = 1920, quality = 0.8): Promise<File> => {
		return new Promise((resolve) => {
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');
			const img = new Image();

			img.onload = () => {
				// Vypočítání nových rozměrů se zachováním poměru stran
				let {width, height} = img;
				if (width > maxWidth) {
					height = (height * maxWidth) / width;
					width = maxWidth;
				}

				canvas.width = width;
				canvas.height = height;

				// Kreslení a komprese
				ctx?.drawImage(img, 0, 0, width, height);
				canvas.toBlob((blob) => {
					if (blob) {
						const compressedFile = new File([blob], file.name, {
							type: 'image/jpeg',
							lastModified: Date.now(),
						});
						resolve(compressedFile);
					} else {
						resolve(file);
					}
				}, 'image/jpeg', quality);
			};

			img.src = URL.createObjectURL(file);
		});
	};

	const uploadFile = async (file: FileWithPath): Promise<FileAttachment> => {
		let processedFile = file;

		// Konverze HEIC na JPEG
		if (file.name.toLowerCase().endsWith('.heic')) {
			processedFile = await convertHeicToJpeg(file);
		}

		// Komprese obrázků
		if (isImage(processedFile.name) && processedFile.size > 2 * 1024 * 1024) {
			processedFile = await compressImage(processedFile);
		}

		// Simulace uploadu - v produkci by to volalo API
		const formData = new FormData();
		formData.append('file', processedFile);
		formData.append('uploadedBy', user?.name || 'unknown');
		formData.append('timestamp', new Date().toISOString());

		// Pro demo účely vytváříme URL.createObjectURL
		const url = URL.createObjectURL(processedFile);
		const thumbnailUrl = isImage(processedFile.name) ? url : undefined;

		return {
			id: crypto.randomUUID(),
			fileName: processedFile.name,
			fileSize: processedFile.size,
			fileType: processedFile.type,
			uploadedAt: new Date(),
			uploadedBy: user?.name || 'unknown',
			url,
			thumbnailUrl,
			rotation: 0
		};
	};

	const handleDrop = useCallback(async (acceptedFiles: FileWithPath[]) => {
		if (disabled) return;

		setUploading(true);
		try {
			const newFiles: FileAttachment[] = [];

			for (const file of acceptedFiles) {
				// Kontrola velikosti
				if (file.size > maxSize * 1024 * 1024) {
					notifications.show({
						title: "Soubor je příliš velký",
						message: `Soubor ${file.name} překračuje maximální velikost ${maxSize}MB`,
						color: "red"
					});
					continue;
				}

				// Kontrola počtu souborů
				if (files.length + newFiles.length >= maxFiles) {
					notifications.show({
						title: "Příliš mnoho souborů",
						message: `Můžete nahrát maximálně ${maxFiles} souborů`,
						color: "orange"
					});
					break;
				}

				try {
					const uploadedFile = await uploadFile(file);
					newFiles.push(uploadedFile);
				} catch (error) {
					notifications.show({
						title: "Chyba uploadu",
						message: `Nepodařilo se nahrát soubor ${file.name}`,
						color: "red"
					});
				}
			}

			onFilesChange([...files, ...newFiles]);
		} finally {
			setUploading(false);
		}
	}, [files, onFilesChange, maxFiles, maxSize, disabled, user]);

	const removeFile = (fileId: string) => {
		const updatedFiles = files.filter(f => f.id !== fileId);
		onFilesChange(updatedFiles);
	};

	const rotateImage = (fileId: string, degrees: number) => {
		const updatedFiles = files.map(f => 
			f.id === fileId 
				? {...f, rotation: (f.rotation || 0) + degrees} 
				: f
		);
		onFilesChange(updatedFiles);
	};

	const openPreview = (file: FileAttachment) => {
		setPreviewFile(file);
		setRotationAngle(file.rotation || 0);
	};

	const FilePreview: React.FC<{file: FileAttachment}> = ({file}) => {
		if (isImage(file.fileName)) {
			return (
				<Card withBorder p="xs" style={{position: 'relative'}}>
					<Image
						src={file.thumbnailUrl}
						alt={file.fileName}
						height={80}
						style={{
							transform: `rotate(${file.rotation || 0}deg)`,
							transition: 'transform 0.3s ease'
						}}
					/>
					<Group gap={4} mt={4}>
						<ActionIcon
							size="xs"
							variant="light"
							onClick={() => rotateImage(file.id, -90)}
							disabled={disabled}
						>
							<IconRotate2 size={12} />
						</ActionIcon>
						<ActionIcon
							size="xs"
							variant="light"
							onClick={() => rotateImage(file.id, 90)}
							disabled={disabled}
						>
							<IconRotateClockwise size={12} />
						</ActionIcon>
						<ActionIcon
							size="xs"
							variant="light"
							onClick={() => openPreview(file)}
						>
							<IconEye size={12} />
						</ActionIcon>
						<ActionIcon
							size="xs"
							color="red"
							variant="light"
							onClick={() => removeFile(file.id)}
							disabled={disabled}
						>
							<IconTrash size={12} />
						</ActionIcon>
					</Group>
				</Card>
			);
		}

		return (
			<Card withBorder p="xs">
				<Group gap="xs">
					<IconFile size={20} />
					<Stack gap={0}>
						<Text size="xs" truncate maw={120}>
							{file.fileName}
						</Text>
						<Text size="xs" c="dimmed">
							{(file.fileSize / 1024).toFixed(1)} KB
						</Text>
					</Stack>
				</Group>
				<Group gap={4} mt={4}>
					<ActionIcon
						size="xs"
						variant="light"
						onClick={() => openPreview(file)}
					>
						<IconEye size={12} />
					</ActionIcon>
					<ActionIcon
						size="xs"
						color="red"
						variant="light"
						onClick={() => removeFile(file.id)}
						disabled={disabled}
					>
						<IconTrash size={12} />
					</ActionIcon>
				</Group>
			</Card>
		);
	};

	return (
		<Box>
			{!disabled && files.length < maxFiles && (
				<Dropzone
					onDrop={handleDrop}
					accept={accept.split(',').reduce((acc, type) => {
						acc[type.trim()] = [];
						return acc;
					}, {} as Record<string, string[]>)}
					maxSize={maxSize * 1024 * 1024}
					loading={uploading}
					disabled={disabled}
				>
					<Group justify="center" gap="xl" style={{minHeight: 100}}>
						<Dropzone.Accept>
							<IconUpload size={50} color="var(--mantine-color-blue-6)" />
						</Dropzone.Accept>
						<Dropzone.Reject>
							<IconX size={50} color="var(--mantine-color-red-6)" />
						</Dropzone.Reject>
						<Dropzone.Idle>
							<IconPhoto size={50} color="var(--mantine-color-dimmed)" />
						</Dropzone.Idle>

						<div>
							<Text size="xl" inline>
								Přetáhněte soubory sem nebo klikněte pro výběr
							</Text>
							<Text size="sm" c="dimmed" inline mt={7}>
								Maximálně {maxFiles} souborů, každý do {maxSize}MB
							</Text>
						</div>
					</Group>
				</Dropzone>
			)}

			{uploading && (
				<Progress value={100} animated mt="md" />
			)}

			{files.length > 0 && (
				<Box mt="md">
					<Text size="sm" fw={500} mb="xs">
						Nahrané soubory ({files.length}/{maxFiles})
					</Text>
					<Grid gutter="xs">
						{files.map((file) => (
							<Grid.Col key={file.id} span={3}>
								<FilePreview file={file} />
							</Grid.Col>
						))}
					</Grid>
				</Box>
			)}

			{/* Preview Modal */}
			<Modal
				opened={!!previewFile}
				onClose={() => setPreviewFile(null)}
				title={previewFile?.fileName}
				size="lg"
			>
				{previewFile && (
					<Stack>
						{isImage(previewFile.fileName) ? (
							<Box ta="center">
								<Image
									src={previewFile.url}
									alt={previewFile.fileName}
									style={{
										transform: `rotate(${rotationAngle}deg)`,
										transition: 'transform 0.3s ease',
										maxHeight: '60vh'
									}}
								/>
								<Group justify="center" mt="md">
									<Button
										variant="light"
										leftSection={<IconRotate2 size={16} />}
										onClick={() => setRotationAngle(prev => prev - 90)}
									>
										Otočit vlevo
									</Button>
									<Button
										variant="light"
										leftSection={<IconRotateClockwise size={16} />}
										onClick={() => setRotationAngle(prev => prev + 90)}
									>
										Otočit vpravo
									</Button>
									<Button
										color="green"
										leftSection={<IconCheck size={16} />}
										onClick={() => {
											rotateImage(previewFile.id, rotationAngle - (previewFile.rotation || 0));
											setPreviewFile(null);
										}}
									>
										Uložit rotaci
									</Button>
								</Group>
							</Box>
						) : isPdf(previewFile.fileName) ? (
							<Box ta="center">
								<Text>PDF preview není dostupný v této verzi</Text>
								<Button
									component="a"
									href={previewFile.url}
									target="_blank"
									mt="md"
								>
									Otevřít PDF
								</Button>
							</Box>
						) : (
							<Box ta="center">
								<IconFile size={64} color="var(--mantine-color-gray-5)" />
								<Text mt="md">{previewFile.fileName}</Text>
								<Text size="sm" c="dimmed">
									{(previewFile.fileSize / 1024).toFixed(1)} KB
								</Text>
							</Box>
						)}
					</Stack>
				)}
			</Modal>
		</Box>
	);
};