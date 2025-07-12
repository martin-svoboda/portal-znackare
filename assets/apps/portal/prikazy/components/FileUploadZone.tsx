import React, {useState, useRef, useCallback, useEffect, useMemo} from "react";
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
	Flex,
	Divider
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
	IconCheck,
	IconCamera,
	IconCameraOff,
	IconCapture,
	IconRepeat
} from "@tabler/icons-react";
import {Dropzone, FileWithPath} from "@mantine/dropzone";
import {useAuth} from "../../auth/AuthContext";
import {FileAttachment} from "../types/HlaseniTypes";
import {notifications} from "@mantine/notifications";
import {useMediaQuery} from "@mantine/hooks";

interface FileUploadZoneProps {
	files: FileAttachment[];
	onFilesChange: (files: FileAttachment[]) => void;
	maxFiles?: number;
	maxSize?: number; // v MB
	accept?: string;
	disabled?: boolean;
	enableCamera?: boolean; // nová možnost
	id?: string; // unique identifier pro izolaci komponent
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const GLOBAL_RENDER_TRACKER = new Map<string, boolean>();

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
																  files,
																  onFilesChange,
																  maxFiles = 5,
																  maxSize = 10,
																  accept = "image/jpeg,image/png,image/heic,application/pdf",
																  disabled = false,
																  enableCamera = true,
																  id = 'default'
															  }) => {
	const {user} = useAuth();
	
	const [renderKey, setRenderKey] = useState(0);
	const componentInstanceId = useMemo(() => `${id}-${Date.now()}-${Math.random().toString(36).substring(2)}`, [id]);
	
	useEffect(() => {
		const timer = setTimeout(() => {
			setRenderKey(prev => prev + 1);
		}, Math.random() * 50);
		
		return () => clearTimeout(timer);
	}, [files.length]);
	
	const filePreviewData = useMemo(() => {
		return files.filter(file => {
			if (!file || typeof file !== 'object') {
				return false;
			}
			return file.id && file.fileName;
		}).map((file, index) => {
			const timestamp1 = Date.now();
			const timestamp2 = performance.now();
			const random = Math.random().toString(36).substring(2, 8);
			const compositeKey = `isolated-${componentInstanceId}-file-${String(file.id)}-idx-${index}-rk-${renderKey}-ts1-${timestamp1}-ts2-${Math.round(timestamp2)}-rnd-${random}`;
			
			return {
				key: compositeKey,
				file,
				index
			};
		});
	}, [files, componentInstanceId, renderKey]);
	
	const [uploading, setUploading] = useState(false);
	const [previewFile, setPreviewFile] = useState<FileAttachment | null>(null);
	const [rotationAngle, setRotationAngle] = useState(0);

	// Camera states
	const [cameraOpen, setCameraOpen] = useState(false);
	const [stream, setStream] = useState<MediaStream | null>(null);
	const [cameraError, setCameraError] = useState<string | null>(null);
	const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
	const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
	const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	// Cleanup při unmount
	useEffect(() => {
		return () => {
			if (stream) {
				stream.getTracks().forEach(track => track.stop());
			}
		};
	}, [stream]);

	const isImage = (filename: string) => {
		return /\.(jpg|jpeg|png|gif|bmp|webp|heic)$/i.test(filename);
	};

	const isPdf = (filename: string) => {
		return /\.pdf$/i.test(filename);
	};

	const convertHeicToJpeg = async (file: File): Promise<File> => {
		return file;
	};

	const compressImage = async (file: File, maxWidth = 1920, quality = 0.8): Promise<File> => {
		return new Promise((resolve) => {
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');
			const img = new Image();

			img.onload = () => {
				let {width, height} = img;
				if (width > maxWidth) {
					height = (height * maxWidth) / width;
					width = maxWidth;
				}

				canvas.width = width;
				canvas.height = height;

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

	const uploadFile = async (file: FileWithPath | File): Promise<FileAttachment> => {
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

		// Generujeme unikátní ID které určitě nekonfliktuje s jinými komponenty
		const timestamp = Date.now();
		const random = Math.random().toString(36).substring(2);
		const uniqueId = `file_${id}_${timestamp}_${random}`;

		const fileAttachment: FileAttachment = {
			id: uniqueId,
			fileName: processedFile.name || `file-${timestamp}`,
			fileSize: processedFile.size || 0,
			fileType: processedFile.type || 'application/octet-stream',
			uploadedAt: new Date(),
			uploadedBy: user?.name || 'unknown',
			url,
			thumbnailUrl,
			rotation: 0
		};

		// Ujistíme se, že objekt je JSON serializovatelný
		try {
			JSON.stringify(fileAttachment);
		} catch (error) {
			console.error('FileAttachment object is not serializable:', error, fileAttachment);
			throw new Error('Failed to create serializable file attachment object');
		}

		// Validace, že všechny povinné vlastnosti jsou přítomny
		if (!fileAttachment.id || !fileAttachment.fileName) {
			throw new Error('Failed to create valid file attachment object');
		}

		return fileAttachment;
	};

	// Camera functions
	const startCamera = async () => {
		setCameraError(null);
		try {
			// Zkusíme nejprve požadovaný facing mode
			let constraints: MediaStreamConstraints = {
				video: {
					facingMode: facingMode,
					width: {ideal: 1920},
					height: {ideal: 1080}
				}
			};

			let mediaStream: MediaStream;
			try {
				mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
			} catch (error) {
				constraints = {
					video: {
						width: {ideal: 1920},
						height: {ideal: 1080}
					}
				};
				mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
			}

			setStream(mediaStream);
			setCameraOpen(true);

			setTimeout(() => {
				if (videoRef.current) {
					videoRef.current.srcObject = mediaStream;
					videoRef.current.play().catch(err => {});
				}
			}, 100);
		} catch (error) {
			setCameraError('Nepodařilo se spustit kameru. Zkontrolujte oprávnění pro kameru v nastavení prohlížeče.');
		}
	};

	const stopCamera = () => {
		if (stream) {
			stream.getTracks().forEach(track => track.stop());
			setStream(null);
		}
		setCameraOpen(false);
		setCameraError(null);
		setCapturedPhoto(null);
		setPhotoBlob(null);
	};

	const switchCamera = async () => {
		if (stream) {
			// Zastavíme aktuální stream
			stream.getTracks().forEach(track => track.stop());
			setStream(null);
		}

		const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
		setFacingMode(newFacingMode);

		try {
			// Spustíme novou kameru s opačným facing mode
			let mediaStream: MediaStream;
			try {
				mediaStream = await navigator.mediaDevices.getUserMedia({
					video: {
						facingMode: newFacingMode,
						width: {ideal: 1920},
						height: {ideal: 1080}
					}
				});
			} catch (error) {
				setCameraError('Zařízení nemá druhou kameru');
				return;
			}

			setStream(mediaStream);

			if (videoRef.current) {
				videoRef.current.srcObject = mediaStream;
				videoRef.current.play().catch(err => {});
			}
		} catch (error) {
			setCameraError('Nepodařilo se přepnout kameru.');
		}
	};

	const capturePhoto = async () => {
		if (!videoRef.current || !canvasRef.current) {
			setCameraError('Video nebo canvas není dostupný');
			return;
		}

		const video = videoRef.current;
		const canvas = canvasRef.current;
		const ctx = canvas.getContext('2d');

		if (!ctx) {
			setCameraError('Nepodařilo se získat kontext canvas');
			return;
		}

		// Zkontrolujeme, zda má video rozměry
		if (video.videoWidth === 0 || video.videoHeight === 0) {
			setCameraError('Video ještě není připraveno. Zkuste to znovu.');
			return;
		}

		// Nastavení rozměrů canvas podle videa
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;

		// Zachycení aktuálního snímku z videa
		ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

		// Převod na blob a zobrazení pro potvrzení
		canvas.toBlob((blob) => {
			if (blob) {
				const photoUrl = URL.createObjectURL(blob);
				setCapturedPhoto(photoUrl);
				setPhotoBlob(blob);
			} else {
				setCameraError('Nepodařilo se vytvořit foto');
			}
		}, 'image/jpeg', 0.9);
	};

	const confirmPhoto = async () => {
		if (!photoBlob) return;

		const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
		const filename = `foto-${timestamp}.jpg`;

		const file = new File([photoBlob], filename, {
			type: 'image/jpeg',
			lastModified: Date.now()
		});

		try {
			setUploading(true);
			setCameraError(null); // Reset error state
			const uploadedFile = await uploadFile(file);
			
			// Ujistíme se, že uploadedFile je validní objekt s požadovanými vlastnostmi
			if (uploadedFile && uploadedFile.id && uploadedFile.fileName) {
				onFilesChange([...files, uploadedFile]);

				notifications.show({
					title: "Foto uloženo",
					message: `Foto ${filename} bylo úspěšně přidáno`,
					color: "green"
				});

				// Zavření kamery po potvrzení
				stopCamera();
			} else {
				throw new Error('Invalid file object returned from upload');
			}
		} catch (error) {
			console.error('Chyba při ukládání foto:', error);
			notifications.show({
				title: "Chyba při ukládání",
				message: "Nepodařilo se uložit foto",
				color: "red"
			});
		} finally {
			setUploading(false);
		}
	};

	const discardPhoto = () => {
		if (capturedPhoto) {
			URL.revokeObjectURL(capturedPhoto);
		}
		setCapturedPhoto(null);
		setPhotoBlob(null);
	};

	const handleDrop = async (acceptedFiles: FileWithPath[]) => {
		if (disabled || uploading) return; // Zabráníme současným uploadům

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
					if (uploadedFile && uploadedFile.id && uploadedFile.fileName) {
						newFiles.push(uploadedFile);
					}
				} catch (error) {
					notifications.show({
						title: "Chyba uploadu",
						message: `Nepodařilo se nahrát soubor ${file.name}`,
						color: "red"
					});
				}
			}

			if (newFiles.length > 0) {
				const validFiles = newFiles.filter(file => file && file.id && file.fileName);
				onFilesChange([...files, ...validFiles]);
			}
		} catch (error) {
		} finally {
			setUploading(false);
		}
	};

	const removeFile = (fileId: string) => {
		// Najdeme soubor který se odstraňuje a vyčistíme jeho URL objekty
		const fileToRemove = files.find(f => f.id === fileId);
		if (fileToRemove) {
			if (fileToRemove.url) {
				URL.revokeObjectURL(fileToRemove.url);
			}
			if (fileToRemove.thumbnailUrl) {
				URL.revokeObjectURL(fileToRemove.thumbnailUrl);
			}
		}
		
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

	const FilePreview: React.FC<{ file: FileAttachment }> = React.memo(({file}) => {
		if (!file || !file.id || !file.fileName) {
			return null;
		}

		const safeId = String(file.id || '');
		const safeFileName = String(file.fileName || 'Neznámý soubor');
		const safeFileSize = Number(file.fileSize) || 0;
		const safeThumbnailUrl = String(file.thumbnailUrl || '');
		const safeRotation = Number(file.rotation) || 0;

		if (isImage(safeFileName)) {
			return (
				<Card withBorder p="xs" style={{position: 'relative'}}>
					<Image
						src={safeThumbnailUrl}
						alt={safeFileName}
						height={80}
						style={{
							transform: `rotate(${safeRotation}deg)`,
							transition: 'transform 0.3s ease'
						}}
					/>
					<Group gap={4} mt={4}>
						<ActionIcon
							size="xs"
							variant="light"
							onClick={() => rotateImage(safeId, -90)}
							disabled={disabled}
						>
							<IconRotate2 size={12}/>
						</ActionIcon>
						<ActionIcon
							size="xs"
							variant="light"
							onClick={() => rotateImage(safeId, 90)}
							disabled={disabled}
						>
							<IconRotateClockwise size={12}/>
						</ActionIcon>
						<ActionIcon
							size="xs"
							variant="light"
							onClick={() => openPreview(file)}
						>
							<IconEye size={12}/>
						</ActionIcon>
						<ActionIcon
							size="xs"
							color="red"
							variant="light"
							onClick={() => removeFile(safeId)}
							disabled={disabled}
						>
							<IconTrash size={12}/>
						</ActionIcon>
					</Group>
				</Card>
			);
		}

		return (
			<Card withBorder p="xs">
				<Group gap="xs">
					<IconFile size={20}/>
					<Stack gap={0}>
						<Text size="xs" truncate maw={120}>
							{safeFileName}
						</Text>
						<Text size="xs" c="dimmed">
							{(safeFileSize / 1024).toFixed(1)} KB
						</Text>
					</Stack>
				</Group>
				<Group gap={4} mt={4}>
					<ActionIcon
						size="xs"
						variant="light"
						onClick={() => openPreview(file)}
					>
						<IconEye size={12}/>
					</ActionIcon>
					<ActionIcon
						size="xs"
						color="red"
						variant="light"
						onClick={() => removeFile(safeId)}
						disabled={disabled}
					>
						<IconTrash size={12}/>
					</ActionIcon>
				</Group>
			</Card>
		);
	});

	const SafeFilePreview: React.FC<{ file: FileAttachment }> = ({ file }) => {
		try {
			if (typeof file !== 'object' || file === null) {
				return (
					<Card withBorder p="xs">
						<Text size="xs" c="red">
							Neplatný objekt souboru
						</Text>
					</Card>
				);
			}

			const safeFile = {
				id: String(file.id || ''),
				fileName: String(file.fileName || ''),
				fileSize: Number(file.fileSize) || 0,
				fileType: String(file.fileType || ''),
				uploadedAt: file.uploadedAt instanceof Date ? file.uploadedAt : new Date(),
				uploadedBy: String(file.uploadedBy || ''),
				url: String(file.url || ''),
				thumbnailUrl: file.thumbnailUrl ? String(file.thumbnailUrl) : undefined,
				rotation: Number(file.rotation) || 0
			};

			for (const [key, value] of Object.entries(safeFile)) {
				if (value !== null && value !== undefined && typeof value === 'object' && !(value instanceof Date)) {
					return (
						<Card withBorder p="xs">
							<Text size="xs" c="red">
								Chyba: Neplatná data souboru ({key})
							</Text>
						</Card>
					);
				}
			}

			try {
				JSON.stringify(safeFile);
			} catch (jsonError) {
				return (
					<Card withBorder p="xs">
						<Text size="xs" c="red">
							Chyba: Neserializovatelný objekt
						</Text>
					</Card>
				);
			}

			try {
				return <FilePreview file={safeFile} />;
			} catch (renderError) {
				return (
					<Card withBorder p="xs">
						<Text size="xs" c="red">
							Chyba v FilePreview komponentě
						</Text>
					</Card>
				);
			}
		} catch (error) {
			return (
				<Card withBorder p="xs">
					<Text size="xs" c="red">
						Chyba při zobrazení souboru
					</Text>
				</Card>
			);
		}
	};

	const containerKey = `fileupload-container-${componentInstanceId}-${renderKey}`;
	
	return (
		<React.Fragment key={containerKey}>
			<Box data-component-id={componentInstanceId} key={`fileupload-${componentInstanceId}-${renderKey}`}>
				{!disabled && files.length < maxFiles && (
					<React.Fragment key={`upload-section-${id}`}>
						<Text size="sm" c="dimmed" inline mb="sm">
							Maximálně {maxFiles} souborů, každý do {maxSize}MB
						</Text>
						<Group gap="md">
							{/* Dropzone pro nahrávání souborů */}
							<Dropzone
								flex="1"
								onDrop={handleDrop}
								accept={accept.split(',').reduce((acc, type) => {
									acc[type.trim()] = [];
									return acc;
								}, {} as Record<string, string[]>)}
								maxSize={maxSize * 1024 * 1024}
								loading={uploading}
								disabled={disabled}
								className="dropzone"
								data-component-id={componentInstanceId}
								key={`dropzone-${componentInstanceId}-${files.length}-${renderKey}`}
							>
							<Group justify="center" p="sm" gap="lg" mih={150} style={{pointerEvents: 'none'}}>
								<Dropzone.Accept>
									<IconUpload size={50} color="var(--mantine-color-blue-6)"/>
								</Dropzone.Accept>
								<Dropzone.Reject>
									<IconX size={50} color="var(--mantine-color-red-6)"/>
								</Dropzone.Reject>
								<Dropzone.Idle>
									<IconPhoto size={50} color="var(--mantine-color-dimmed)"/>
								</Dropzone.Idle>

								<div>
									<Text size={useMediaQuery('(max-width: 50em)') ? "md" : "xl"} inline>
										Přetáhněte soubory sem nebo klikněte pro výběr
									</Text>
								</div>
							</Group>
						</Dropzone>

						{/* Kamera tlačítko */}
						{enableCamera && 'mediaDevices' in navigator && (

							<Button
								mih={150}
								miw="20%"
								variant="default"
								size="lg"
								onClick={startCamera}
								disabled={disabled || uploading}
							>
								<Stack justify="center" align="center" gap="sm">
									<IconCamera size={50} color="var(--mantine-color-dimmed)"/>
									<Text size="md" c="dimmed">
										Vyfotit
									</Text>
								</Stack>
							</Button>
						)}
					</Group>
				</React.Fragment>
			)}

			{uploading && (
				<Progress value={100} animated mt="md" key={`progress-${componentInstanceId}-${renderKey}`}/>
			)}

			{files.length > 0 && (
				<Box mt="md" key={`filelist-${componentInstanceId}-${renderKey}`} data-component-id={componentInstanceId}>
					<Text size="sm" fw={500} mb="xs">
						Nahrané soubory ({files.length}/{maxFiles})
					</Text>
					<Grid gutter="xs" key={`grid-${componentInstanceId}-${renderKey}`} data-component-id={componentInstanceId}>
						{filePreviewData.map(({key, file, index}) => (
							<React.Fragment key={`fragment-${key}`}>
								<Grid.Col key={key} span={3} data-component-id={componentInstanceId}>
									<SafeFilePreview file={file} key={`preview-${key}`}/>
								</Grid.Col>
							</React.Fragment>
						))}
					</Grid>
				</Box>
			)}
		</Box>
		
		{/* Camera Modal */}
		<Modal
				opened={cameraOpen}
				onClose={stopCamera}
				withCloseButton={false}
				size="55rem"
				fullScreen={useMediaQuery('(max-width: 50em)')}
				centered
				padding="0"
			>
				<Stack>
					{cameraError ? (
						<Alert color="red" title="Chyba kamery">
							{cameraError}
						</Alert>
					) : capturedPhoto ? (
						<>
							{/* Photo confirmation view */}
							<Box pos="relative" style={{textAlign: 'center'}}>
								<Text size="lg" fw={500} mb="md">
									Zkontrolujte kvalitu fotky
								</Text>
								<Image
									src={capturedPhoto}
									alt="Zachycená fotka"
									style={{
										width: '100%',
										maxHeight: '70vh',
										objectFit: 'contain',
										border: '2px solid var(--mantine-color-gray-3)'
									}}
								/>
							</Box>

							<Group justify="center" gap="md" mb="md">
								<Button
									variant="light"
									color="red"
									leftSection={<IconX size={16}/>}
									onClick={discardPhoto}
								>
									Vyfotit znovu
								</Button>

								<Button
									color="green"
									leftSection={<IconCheck size={16}/>}
									onClick={confirmPhoto}
									loading={uploading}
								>
									Potvrdit
								</Button>
							</Group>
						</>
					) : (
						<>
							{/* Live camera view */}
							<Box pos="relative" style={{textAlign: 'center'}}>
								<video
									ref={videoRef}
									autoPlay
									playsInline
									muted
									style={{
										width: '100%',
										maxHeight: '80vh',
										objectFit: 'cover',
									}}
								/>
								<canvas
									ref={canvasRef}
									style={{display: 'none'}}
								/>
							</Box>

							<Group justify="center" gap="md" mb="md">
								<ActionIcon
									variant="light"
									size="lg"
									radius="xl"
									aria-label="Přepnout kameru"
									onClick={switchCamera}
								>
									<IconRepeat style={{width: '70%', height: '70%'}} stroke={1.5}/>
								</ActionIcon>

								<ActionIcon
									size="xl"
									radius="xl"
									aria-label="Zachytit foto"
									onClick={capturePhoto}
								>
									<IconCapture style={{width: '70%', height: '70%'}} stroke={1.5}/>
								</ActionIcon>

								<ActionIcon
									variant="light"
									size="lg"
									radius="xl"
									color="red"
									aria-label="Zavřít kameru"
									onClick={stopCamera}
								>
									<IconCameraOff style={{width: '70%', height: '70%'}} stroke={1.5}/>
								</ActionIcon>

							</Group>
						</>
					)}
				</Stack>
			</Modal>

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
										leftSection={<IconRotate2 size={16}/>}
										onClick={() => setRotationAngle(prev => prev - 90)}
									>
										Otočit vlevo
									</Button>
									<Button
										variant="light"
										leftSection={<IconRotateClockwise size={16}/>}
										onClick={() => setRotationAngle(prev => prev + 90)}
									>
										Otočit vpravo
									</Button>
									<Button
										color="green"
										leftSection={<IconCheck size={16}/>}
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
								<IconFile size={64} color="var(--mantine-color-gray-5)"/>
								<Text mt="md">{previewFile.fileName}</Text>
								<Text size="sm" c="dimmed">
									{(previewFile.fileSize / 1024).toFixed(1)} KB
								</Text>
							</Box>
						)}
					</Stack>
				)}
			</Modal>
		
		</React.Fragment>
	);
};
