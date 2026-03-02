import type { Meta, StoryObj } from '@storybook/react';
import { CodeBlock } from './CodeBlock';

const sampleTS = `import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  );
}`;

const sampleGo = `package main

import "fmt"

func main() {
    for i := 0; i < 10; i++ {
        fmt.Printf("Hello %d\\n", i)
    }
}`;

const samplePHP = `namespace App\\Laravilt\\Admin\\Resources\\Product;

use App\\Models\\Product;
use Laravilt\\Panel\\Resources\\Resource;
use Laravilt\\Schemas\\Schema;
use Laravilt\\Tables\\Table;

class ProductResource extends Resource
{
    protected static string $model = Product::class;

    protected static ?string $navigationIcon = 'Package';
    protected static ?string $navigationGroup = 'Shop';
    protected static ?int $navigationSort = 1;

    public static function form(Schema $form): Schema
    {
        return ProductForm::configure($form);
    }

    public static function table(Table $table): Table
    {
        return ProductTable::configure($table);
    }

    public static function getNavigationBadge(): ?string
    {
        return (string) static::getModel()::count();
    }
}`;

const sampleRust = `use tokio::net::TcpListener;
use tonic::transport::Server;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let addr = "0.0.0.0:50051".parse()?;
    let listener = TcpListener::bind(addr).await?;

    println!("Server listening on {}", addr);

    Server::builder()
        .add_service(HealthServer::new(HealthService))
        .serve_with_incoming(listener)
        .await?;

    Ok(())
}`;

const sampleCSS = `.code-block {
  border: 1px solid var(--color-border);
  border-radius: 6px;
  overflow: hidden;
  background: var(--color-bg-contrast);
}`;

const meta = {
  title: 'Editor/CodeBlock',
  component: CodeBlock,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    language: {
      control: 'select',
      options: ['typescript', 'javascript', 'go', 'python', 'rust', 'php', 'css', 'html', 'json', 'bash'],
    },
    showLineNumbers: { control: 'boolean' },
    copyable: { control: 'boolean' },
    exportable: { control: 'boolean' },
    exportImage: { control: 'boolean' },
    wrapLines: { control: 'boolean' },
    showWindowDots: { control: 'boolean' },
    maxHeight: { control: 'number' },
  },
} satisfies Meta<typeof CodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PHP: Story = {
  args: {
    code: samplePHP,
    language: 'php',
    exportImage: true,
  },
};

export const TypeScript: Story = {
  args: {
    code: sampleTS,
    language: 'typescript',
    exportImage: true,
  },
};

export const Go: Story = {
  args: {
    code: sampleGo,
    language: 'go',
  },
};

export const Rust: Story = {
  args: {
    code: sampleRust,
    language: 'rust',
    exportImage: true,
  },
};

export const WithHighlightedLines: Story = {
  args: {
    code: sampleTS,
    language: 'typescript',
    highlightLines: [3, 4, 5],
  },
};

export const NoLineNumbers: Story = {
  args: {
    code: sampleCSS,
    language: 'css',
    showLineNumbers: false,
  },
};

export const NoWindowDots: Story = {
  args: {
    code: sampleGo,
    language: 'go',
    showWindowDots: false,
  },
};

export const AllExportOptions: Story = {
  args: {
    code: sampleGo,
    language: 'go',
    exportable: true,
    exportImage: true,
    filename: 'main.go',
  },
};

export const WordWrapped: Story = {
  args: {
    code: 'const longLine = "This is a very long line that should wrap when word wrap is enabled. It keeps going and going to demonstrate the wrapping behavior of the code block component.";',
    language: 'javascript',
    wrapLines: true,
  },
};

export const ScrollableMaxHeight: Story = {
  args: {
    code: Array.from({ length: 50 }, (_, i) => `line ${i + 1}: console.log("hello");`).join('\n'),
    language: 'javascript',
    maxHeight: 200,
  },
};

export const NoCopyButton: Story = {
  args: {
    code: sampleCSS,
    language: 'css',
    copyable: false,
  },
};

export const PlainText: Story = {
  args: {
    code: 'Just some plain text\nwith multiple lines\nand no language specified.',
    showWindowDots: false,
  },
};
