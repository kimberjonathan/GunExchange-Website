import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-9 w-9 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200" 
          data-testid="button-theme-toggle"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-yellow-500" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <DropdownMenuItem 
          onClick={() => setTheme("light")} 
          className={`hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 ${theme === "light" ? "bg-gray-100 dark:bg-gray-700" : ""}`}
          data-testid="theme-light"
        >
          <Sun className="mr-2 h-4 w-4 text-yellow-500" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")} 
          className={`hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 ${theme === "dark" ? "bg-gray-100 dark:bg-gray-700" : ""}`}
          data-testid="theme-dark"
        >
          <Moon className="mr-2 h-4 w-4 text-blue-400" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")} 
          className={`hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 ${theme === "system" ? "bg-gray-100 dark:bg-gray-700" : ""}`}
          data-testid="theme-system"
        >
          <Monitor className="mr-2 h-4 w-4 text-gray-600 dark:text-gray-400" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}