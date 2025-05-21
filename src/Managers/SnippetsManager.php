<?php

namespace PortalZnackare\Managers;

use PortalZnackareDeps\Wpify\Snippets\CopyrightShortcode;
use PortalZnackareDeps\Wpify\Snippets\RemoveAccentInFilenames;

final class SnippetsManager {
	public function __construct(
		RemoveAccentInFilenames $remove_accent_in_filenames,
		CopyrightShortcode $copyright_shortcode
	) {
	}
}
